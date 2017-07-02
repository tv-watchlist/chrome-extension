import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

const global = {
  indexedDB: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
  IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction,
  IDBKeyRange: window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange,
  IDBCursor: window.IDBCursor || window.webkitIDBCursor || window.msIDBCursor
};

export class IDXSchema {
  dbName: string;
  version: number;
  /**
   * version integer starting from 1
   */
  revision: {[version: number]: IDXTable[]};
  /**
   * seed data starting from version 1
   */
  seedData?: {[version: number]: {[storeName: string]: any[]}};
}

export class IDXTransform {
  destination: string;
  fieldMapping: {[field: string]: string};
}
/**
 * contains all revision history for existing user
 * based on existing user backlog, start from where missed serially
 * order of operations: transform, drop, refresh, merge, seedData
 */
export class IDXTable {
  name: string;
  /**
   * operation to perform
   * 'CREATE' - create new object store
   * 'DROP' - delete object store
   * 'ALTER' - modify properties of objectstore or drop and create Indexes
   * 'REFRESH' - drop and create again
   * Note: make backup of existing store first before editing existing
   */
  operation: 'CREATE'| 'DROP'| 'ALTER'| 'REFRESH';
  primaryField: string | string[];
  autoIncrement: boolean;
  indexes: IDXIndex[];
  transform?: IDXTransform; // copy and transfer data to new/existing store
  // 'transform': [{ 'srcStore': '', 'destStore': '', 'srcField': [], 'destField': [] }],
  // transform?: {'source': IDXTable, 'target': IDXTable};
}

export class IDXIndex {
    name: string;
    field: string | string[];
    operation: 'CREATE'| 'DROP'| 'ALTER'| 'REFRESH';
    unique: boolean;
    /**
     * can index a field which is an array(i.e. can do tags)
     */
    multiEntry: boolean;
}

const TransactionType = {
  READ_ONLY: 'readonly',
  READ_WRITE: 'readwrite'
};

const CursorType = {
  NEXT: 'next',
  NEXT_NO_DUPLICATE: 'nextunique',
  PREV: 'prev',
  PREV_NO_DUPLICATE: 'prevunique'
};

export type Operator = '=='|'<'|'<='|'>'|'>='|'> && <'|'>= && <='|'> && <='|'>= && <';

export interface RangeValues {
  first: string;
  second?: string;
}

@Injectable()
export class IDXDataDefinitionService {

  private _schema: IDXSchema = null;
  private _db: IDBDatabase = null;
  private _version: number = null;
  private _dbName: string = null;

  constructor(private logger: LoggerService) {
    logger.debug('new IDXDataDefinitionService called');
  }

  getIndexedDB() {
    if (!global.indexedDB) {
      throw new Error('Current browser does not support indexedDB.');
    }
    return global.indexedDB;
  }

  Open(schema: IDXSchema): Promise<IDBDatabase> {
    // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
    // https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/
    return new Promise((resolve, reject) => {
      if (!this._schema) { // save schema in memmory
        this._schema = schema;
      }

      if (!this._schema) {
        reject(new Error('schema is not defined'));
      }

      this.logger.debug('about to open...', this._schema);

      try {
        this.Close();
        const dbOpenRequest = this.getIndexedDB().open(this._schema.dbName, this._schema.version);
        dbOpenRequest.onerror = (err) => {
          this.logger.debug('dbOpenRequest.onerror!', err);
          reject(err);
        };
        dbOpenRequest.onblocked = () => {
          this.logger.debug('dbOpenRequest.onblocked!');
          reject(new Error('Database schema cannot be modified, its in use. Close all open connection.'));
        };
        dbOpenRequest.onsuccess = (event) => {
          this._db = dbOpenRequest.result;
          this._version = this._schema.version;
          this._dbName = this._schema.dbName;
          this.logger.debug('dbOpenRequest.onsuccess!', this);
          resolve(this._db);
        };
        dbOpenRequest.onupgradeneeded = (event) => {
          this.logger.debug('dbOpenRequest.onupgradeneeded!: ', event);
          this._db = dbOpenRequest.result;
          const oldVersion = event.oldVersion;
          const newVersion = event.newVersion;
          const transaction = dbOpenRequest.transaction; // VERSION_CHANGE mode
          for (let index = 1; index <= this._schema.version; index++) {
            if (index > oldVersion) {
              const stores = this._schema.revision[index];
              stores.forEach((store, idx, strArray) => {
                switch (store.operation) {
                  case 'CREATE':
                  case 'ALTER':
                    this.CreateObjectStore(store, transaction);
                    break;
                  case 'DROP':
                    this.DropObjectStore(store.name);
                    break;
                  case 'REFRESH':
                    this.DropObjectStore(store.name);
                    this.CreateObjectStore(store, transaction);
                  break;
                  default:
                  this.logger.error(`store.operation ${store.operation} not recognized`);
                    break;
                }
              });
            }
          }

          transaction.oncomplete = () => {
            // do all data initialization here
            const dml = new IDXDataManipulationService(this.logger);
            dml.setDB(transaction.db);
            this.logger.debug('indexedDB.onupgradeneeded complete! ');
            // do data init or data migration here
            for (let index = 1; index <= this._schema.version; index++) {
              if (index > oldVersion) {
                const stores = this._schema.seedData[index];
                for (const storeName in stores) {
                  if (stores.hasOwnProperty(storeName)) {
                    dml.AddList(storeName, stores[storeName]);
                  }
                }
              }
            }

            // should not close db once upgrade is over
            // since if called then success is not called and error is invoked.
            // dont put resolve here since its not the end yet
            //// db.close();
            //// resolve(1)
          };
        };
      } catch (error) {
        this.logger.debug('surya err: ', error);
        reject(error);
      }
    });
  };

  DropObjectStore(storeName: string) {
      if (this._db.objectStoreNames.contains(storeName)) {
        this._db.deleteObjectStore(storeName);
        this.logger.debug('objectstore ' + storeName + ' dropped');
      } else {
        this.logger.debug('Doesnt exist! cannot delete ObjectStore ', storeName);
      }
  }

  CreateObjectStore(storeSchema, transaction: IDBTransaction) {
    this.logger.debug('CreateObjectStore', storeSchema);
    const strParam: IDBObjectStoreParameters = {};
    if (!!storeSchema.primaryField) {
      strParam.keyPath = storeSchema.primaryField;
    }

    strParam.autoIncrement = (storeSchema.autoIncrement !== undefined) ? storeSchema.autoIncrement : false;
    // create new store or get reference if exists
    let store: IDBObjectStore;
    if (this._db.objectStoreNames.contains(storeSchema.name)) {
      store = transaction.objectStore(storeSchema.name);
    } else {
      store = this._db.createObjectStore(storeSchema.name, strParam);
    }
    // delete existing indexes if any
    const indexNames = store.indexNames;
    for (let i = 0; i < store.indexNames.length; i++) {
      store.deleteIndex(store.indexNames[i]);
    }
    // create new indexes if defined in schema
    if (!!storeSchema.indexes) {
      for (let i = 0; i < storeSchema.indexes.length; i++) {
        const idxParam: IDBIndexParameters = {};
        idxParam.unique = (storeSchema.indexes[i].unique !== undefined) ? idxParam.unique : false;
        idxParam.multiEntry = (storeSchema.indexes[i].multiEntry !== undefined) ? idxParam.multiEntry : false;

        store.createIndex(storeSchema.indexes[i].name, storeSchema.indexes[i].field, idxParam);
      }
    }
  }

  Close() {
    if (this._db !== null) {
      this._db.close();
    }
  }

  Dispose() {
    this.Close();
    this._schema = null;
    this._db = null;
    this._version = null;
    this._dbName = null;
  }

  DeleteDatabase(dbName) {
    this.logger.debug('DeleteDatabase ', dbName || this._dbName);
    return new Promise((resolve, reject) => {
      this.Close();
      const deleteReq = this.getIndexedDB().deleteDatabase(dbName || this._dbName);
      deleteReq.onsuccess = () => {
        this.logger.debug('Database deleted');
        resolve(true);
      };
      deleteReq.onblocked = (e) => {
        // alert('database blocked. Please close all tabs');
        this.logger.debug('db Blocked!: ', e);
        reject([false, e]);
      };
      deleteReq.onerror = (e) => {
        // alert('Could not delete database. Database may not exist');
        reject([false, e]);
      };
    });
  }
}

@Injectable()
export class IDXDataManipulationService {
  private db: IDBDatabase;
  constructor(private logger: LoggerService) { }
  public setDB(db: IDBDatabase) {
      this.db = db;
      this.logger.log('setting db');
      Promise.resolve();
  }

/**
 * for '>= && <=' IDBKeyRange.bound(searchTerm, searchTerm + '\uffff')
 * It'd be better to use \uffff as your dagger rather than z.
 * You won't get search results like 'wikipedia' when searching for
 * 'wiki' if you use z...
 * @param operator
 * @param values
 */
  GetKeyRange(operator: Operator, values: RangeValues) {
    // this.logger.debug('GetKeyRange',operator, values);
    let range = null;
    switch (operator) {
      case '==':
        range = IDBKeyRange.only(values.first);
        break;
      case '<':
        range = IDBKeyRange.upperBound(values.first, true);
        break;
      case '<=':
        range = IDBKeyRange.upperBound(values.first);
        break;
      case '>':
        range = IDBKeyRange.lowerBound(values.first, true);
        break;
      case '>=':
        range = IDBKeyRange.lowerBound(values.first);
        range.upperOpen = true;
        break;
      case '> && <':
        range = IDBKeyRange.bound(values.first, values.second, true, true);
        break;
      case '>= && <=':
        range = IDBKeyRange.bound(values.first, values.second + '\uffff');
        break;
      case '> && <=':
        range = IDBKeyRange.bound(values.first, values.second, true, false);
        break;
      case '>= && <':
        range = IDBKeyRange.bound(values.first, values.second, false, true);
        break;
    }
    return range;
  }

  GetObj(storeName: string, key: string|number) {
    return new Promise((resolve, reject) => {
      if (!storeName || !key) {
        reject('storeName or key cannot be empty');
      } else {
        const transaction = this.db.transaction([storeName], TransactionType.READ_ONLY);
        let obj = null;
        transaction.oncomplete = (event) => {
          resolve([obj, storeName]);
        };
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.get(key);
        request.onerror = (e) => { reject(e); };
        request.onsuccess = (event) => {
          obj = request.result;
        };
      }
    });
  }

  SetObj(storeName: string, obj: any) {
    return new Promise((resolve, reject) => {
      if (!storeName || !obj) {
        reject('storeName or obj cannot be empty');
      } else {
        const transaction = this.db.transaction([storeName], TransactionType.READ_WRITE);

        const store = transaction.objectStore(storeName);
        const request = store.put(obj);
        request.onerror = (e) => { reject(e); };
        request.onsuccess = (event) => {
          resolve(true);
        };
      }
    });
  }

  ClearObjectStore(storeName: string) {
    return new Promise((resolve, reject) => {
      if (this.db.objectStoreNames.contains(storeName)) {
        const clearTransaction = this.db.transaction([storeName], TransactionType.READ_WRITE);
        const clearRequest = clearTransaction.objectStore(storeName).clear();
        clearRequest.onsuccess = (event) => {
          resolve(true);
        };
        clearRequest.onerror = (event) => {
          reject(event);
        };
      } else {
        this.logger.debug('Does not exist! cannot clear ObjectStore ', storeName);
        reject(false);
      }
    });
  }

  ClearAllStores(skipStores: string[] = []) {
    return new Promise((resolve, reject) => {
      const storeList = this.db.objectStoreNames;
      this.logger.debug(storeList);

      const len = storeList.length - skipStores.length;
      let count = 0;
      for (let i = 0; i < storeList.length; i++) {
        if (skipStores.includes(storeList[i])) { // ['listings', 'schedules']
          continue;
        }
        this.ClearObjectStore(storeList[i]).then((cleared) => {
          count++;
          if (len === count) {
            resolve([count, skipStores.length, storeList.length]);
          }
        }).catch((notCleared) => {
          reject(notCleared);
        });
      }

      if (len === 0) {
        reject(null);
      }
    });
  }

  Delete(storeName: string, key: string| number) {
    return new Promise((resolve, reject) => {
      if (!storeName || !key) {
        reject('storeName or key cannot be empty');
      } else {
        const request = this.db.transaction(storeName, TransactionType.READ_WRITE)
          .objectStore(storeName)
          .delete(key);
        request.onsuccess = (event) => {
          resolve(true);
        };
        request.onerror = (event) => {
          reject(event);
        };
      }
    });
  }

  /**
   * Uses cursor
   * @param storeName
   * @param indexName
   * @param operator
   * @param values
   */
  DeleteRange(storeName: string, indexName: string, operator: Operator, values: RangeValues) {
    return new Promise((resolve, reject) => {
      if (!storeName || !indexName || !operator || !values) {
        reject('storeName, indexName, operator, values cannot be empty');
      } else {

        const transaction = this.db.transaction([storeName], TransactionType.READ_WRITE);
        transaction.oncomplete = (event) => {
          resolve(true);
        };
        transaction.onerror = (e) => { reject(e); };
        const store = transaction.objectStore(storeName);

        const Index = store.index(indexName);
        const cursorRequest = Index.openCursor(this.GetKeyRange(operator, values));
        cursorRequest.onsuccess = (ev) => {
          const cursor = cursorRequest.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      }
    });
  }

  FetchAll(storeName: string, resultMapKey?: string) {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, TransactionType.READ_ONLY);
        const list = resultMapKey ? {} : [] ;
        transaction.oncomplete = (event) => {
            // this.logger.log(results);
            resolve([list, storeName]);
        };
        transaction.onerror = function(e) {reject(e); };
        const cursorRequest = transaction.objectStore(storeName).openCursor();

        cursorRequest.onsuccess = function(ev) {
              const cursor = cursorRequest.result;
              if (!cursor) {
                  return;
              }
              if (Array.isArray(list)) {
                list.push(cursor.value);
              } else {
                  list[cursor.value[resultMapKey]] = cursor.value;
              }
              cursor.continue();
          };
    });
  }

  /**
   * Uses Cursor, if indexName is null then will search on whole objectStore
   * @param storeName
   * @param operator
   * @param values
   * @param options
   */
  FindAllFiltered(storeName: string, operator: Operator, values: RangeValues,
                   options: {indexName?: string, orderbyDesc?: boolean,
                             limit?: number, resultMapKey?: string }) {
    return new Promise((resolve, reject) => {
      if (!storeName || !operator || !values) {
        reject('storeName, operator, values cannot be empty');
      } else {
        const resultSet = !!options.resultMapKey ? {} : [];
        const transaction = this.db.transaction([storeName], TransactionType.READ_ONLY);
        transaction.oncomplete = (event) => {
          resolve([resultSet, storeName]);
        };
        transaction.onabort = (event) => {
          resolve([resultSet, storeName]);
        };
        transaction.onerror = (e) => { reject(e); };
        const store = transaction.objectStore(storeName);
        let cursorRequest = null;
        if (!!options.indexName) {
          const Index = store.index(options.indexName);
          cursorRequest = options.orderbyDesc ?
            Index.openCursor(this.GetKeyRange(operator, values), CursorType.PREV) :
            Index.openCursor(this.GetKeyRange(operator, values));
        } else {
          cursorRequest = options.orderbyDesc ?
            store.openCursor(this.GetKeyRange(operator, values), CursorType.PREV) :
            store.openCursor(this.GetKeyRange(operator, values));
        }
        let limit = options.limit;
        if (!!limit) {
            cursorRequest.onsuccess = (ev) => {
                const cursor = cursorRequest.result;
                if (cursor) {
                  if (limit > 0) {
                    if (Array.isArray(resultSet)) {
                      resultSet.push(cursor.value);
                    }else {
                      resultSet[cursor.value[options.resultMapKey]] = cursor.value;
                    }
                    limit--;
                    // this.logger.debug(cursor.value);
                    cursor.continue();
                  } else {
                    try {
                      transaction.abort();
                    } catch (e) {
                      this.logger.debug(e);
                    }
                  }
                }
              };
        } else {
          cursorRequest.onsuccess = (ev) => {
            const cursor = cursorRequest.result;
            if (cursor) {
              // this.logger.debug(cursor.value);
              if (Array.isArray(resultSet)) {
                resultSet.push(cursor.value);
              }else {
                resultSet[cursor.value[options.resultMapKey]] = cursor.value;
              }
              cursor.continue();
            }
          };
        }
      }
    });
  }

  AddList(storeName, list: any| any[]): Promise<[number, number, boolean]> {
    return new Promise((resolve, reject) => {
      if (!storeName || !list) {
        reject('storeName,list cannot be empty');
      } else {
        let _list = [];
        if (Array.isArray(list)) {
          _list = list;
        } else {
          for (const key in list) {
            if (list.hasOwnProperty(key)) {
              _list.push(list[key]);
            }
          }
        }

        const transaction = this.db.transaction([storeName], TransactionType.READ_WRITE);
        let count = 0;
        transaction.oncomplete = (event) => {
          this.logger.debug(storeName + ' Added ' + count + '/' + _list.length);
          resolve([count, _list.length, true]); // final result
        };
        transaction.onabort = (event) => {
          resolve([count, _list.length, true]); // final result
        };
        transaction.onerror = (e) => { reject(e); };

        const store = transaction.objectStore(storeName);
        if (_list.length === 0) {
          transaction.abort();
          return;
        }

        // not using foreach.
        const putNext = () => {
          if (count < _list.length) {
            store.put(_list[count]).onsuccess = putNext;
            ++count;
            resolve([count, _list.length, false]); // for progress
          } else {   // complete
            this.logger.debug('populate complete');
          }
        };
        putNext();
      }
    });
  }

  // new
  Count(storeName: string, operator: Operator, values: RangeValues) {
    return new Promise((resolve, reject) => {
      if (!storeName) {
        reject('storeName cannot be empty');
      } else {
        const transaction = this.db.transaction([storeName], TransactionType.READ_ONLY);
        let obj = 0;
        transaction.oncomplete = (event) => {
          resolve(obj);
        };
        const objectStore = transaction.objectStore(storeName);
        const request = !!operator ?
          objectStore.count(this.GetKeyRange(operator, values)) :
          objectStore.count();
        request.onerror = (e) => { reject(e); };
        request.onsuccess = (event) => {
          obj = request.result;
        };
      }
    });
  }

  // new
  IndexCount(storeName: string, indexName: string, operator: Operator, values: RangeValues) {
    return new Promise((resolve, reject) => {
      if (!storeName || !indexName) {
        reject('storeName, indexName cannot be empty');
      } else {
        const transaction = this.db.transaction([storeName], TransactionType.READ_ONLY);
        let obj = 0;
        transaction.oncomplete = (event) => {
          resolve(obj);
        };
        const objectStore = transaction.objectStore(storeName);
        const index = objectStore.index(indexName);
        const request = !!operator ?
          index.count(this.GetKeyRange(operator, values)) :
          index.count();

        request.onerror = (e) => { reject(e); };
        request.onsuccess = (event) => {
          obj = request.result;
        };
      }
    });
  }

  // new, only chrome 45.0 has support
  GetAll(storeName: string, operator?: Operator, values?: RangeValues, count?: number) {
    return new Promise((resolve, reject) => {
      if (!storeName) {
        reject('storeName cannot be empty');
      } else {
        const transaction = this.db.transaction([storeName], TransactionType.READ_ONLY);
        let obj = null;
        transaction.oncomplete = (event) => {
          resolve([obj, storeName]);
        };

        const objectStore = transaction.objectStore(storeName);
        let request = null;
        if (!operator && !count) {
          request = objectStore.getAll();
        } else if (!!operator && !count) {
          request = objectStore.getAll(this.GetKeyRange(operator, values));
        } else if (!operator && !!count) {
          request = objectStore.getAll(null, count);
        } else {
          request = objectStore.getAll(this.GetKeyRange(operator, values), count);
        }

        request.onerror = (e) => { reject(e); };
        request.onsuccess = (event) => {
          obj = request.result;
        };
      }
    });
  }

  // Uses openCursor,
  GetKeyList(storeName: string, indexName: string, operator: Operator, values: RangeValues, orderbyDesc?: boolean) {
    return new Promise((resolve, reject) => {
      if (!storeName || !indexName) {
        reject('storeName cannot be empty');
      } else {
        const transaction = this.db.transaction([storeName], TransactionType.READ_ONLY);
        const list = [];
        transaction.oncomplete = (event) => {
          resolve([list, storeName]);
        };
        transaction.onerror = (e) => { reject(e); };
        const objectStore = transaction.objectStore(storeName);
        let cursorRequest = null;
        if (indexName) {
          const Index = objectStore.index(indexName);
          cursorRequest = orderbyDesc ?
            Index.openCursor(this.GetKeyRange(operator, values), CursorType.PREV) :
            Index.openCursor(this.GetKeyRange(operator, values));
        } else {
          cursorRequest = orderbyDesc ? objectStore.openCursor(null, CursorType.PREV) : objectStore.openCursor();
        }

        cursorRequest.onsuccess = function (ev) {
          const cursor = cursorRequest.result || ev.target.result;
          if (!cursor) {
            return;
          }

          list.push(cursor.key);
          cursor.continue();
        };
      }
    });
  }

  ExportDB(skipStores) {
    return new Promise((resolve, reject) => {
      skipStores = skipStores || [];
      const storeList = this.db.objectStoreNames;
      const len = storeList.length - skipStores.length;
      const obj = {};
      let index = 0;
      for (let i = 0; i < storeList.length; i++) {
        if (skipStores.includes(storeList[i])) {// ['listings', 'schedules']
          continue;
        }
        this.FetchAll(storeList[i]).then(([list, storeName]) => {
          obj[storeName] = list;
          index++;
          if (index === len) {
            resolve(JSON.stringify(obj));
          }
        }).catch((err) => {
          this.logger.debug(err);
          index++;
          if (index === len) {
            resolve(JSON.stringify(obj));
          }
        });
      }

      if (len === 0) {
        resolve('');
      }
    });
  };

  ImportDB(jsonString: string, skipStores: string[]) {
    return new Promise((resolve, reject) => {
      skipStores = skipStores || [];
      const storeList = this.db.objectStoreNames;
      const len = storeList.length - skipStores.length;
      const obj = JSON.parse(jsonString);
      let index = 0;
      for (let i = 0; i < storeList.length; i++) {
        if (skipStores.includes(storeList[i])) { // ['listings', 'schedules']
          continue;
        }
        this.AddList(storeList[i], obj[storeList[i]]).then((status) => {
          if (status[2]) {
            index++;
            if (index === len) {
              resolve([index, len]);
            }
          }
        }).catch((err) => {
          index++;
          if (index === len) {
            resolve([index, len]);
          }
        });
      }

      if (len === 0) {
        resolve('');
      }
    });
  };
}
