/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

interface IDBEnvironment {
   mozIndexedDB: IDBFactory;
   webkitIndexedDB: IDBFactory;
   msIndexedDB: IDBFactory;

   IDBTransaction: IDBTransaction,
   webkitIDBTransaction: IDBTransaction,
   msIDBTransaction: IDBTransaction,
   
   IDBKeyRange:IDBKeyRange,
   webkitIDBKeyRange:IDBKeyRange,
   msIDBKeyRange:IDBKeyRange,

   IDBCursor:IDBCursor,
   webkitIDBCursor:IDBCursor,
   msIDBCursor:IDBCursor
}

interface IDBObjectStore {
  getAll(query?: IDBKeyRange, count?: number);
}