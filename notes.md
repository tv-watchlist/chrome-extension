reference extension resources
https://medium.com/@_JoshSommer/build-a-simple-emoji-chrome-extension-with-angular-cli-84937a1ca640
https://www.sitepoint.com/chrome-extension-angular-2/
https://cito.github.io/blog/web-ext-with-angular/


Here is the backup file as requested ( It is huge ).. I'd also like to recommend not outputting all code to the backup / restore window as it takes upwards of a minute for it to load despite having SSD because of Chrome... A simple Download Backup and Upload Backup button would be exponentially faster with an AJAX enabled button which adds the box for users that want it... This way it won't load on page open but users that do like it won't lose it...

1MB in zip, 6MB extracted ( not all shows marked as seen are episodes I've watched - and if I do watch something like got talent, sharks tank or shows like that there is so much repeated material when reintroducing people after break and etc... the show ends up being maybe 30% "new" material.. )... https://dl.dropboxusercontent.com/u/26074909/debugging/chrome_addons/tv_watchlist/tv-watchlist-2016-08-07.zip  -- note I'd love to see hulu url pre-created and netflix too... I modified my current bookmarklet as it is output but left some of the rules in place which need to be changed ( for sites that don't use digit ids otherwise every id would need to be added and I'd end up created a text file db for them )...

I added a few more large shows and one of them was taking a while to add so I clicked it again... That seems to have corrupted my file and several of my shows are reporting that I haven't watched anything... Can I recommend separating the data slightly? Basically have one set of data be only shows watched which is simply key as show id, then a table for season with number as id, then key = true for each that is watched... Very lightweight. then when adding shows it won't corrupt. Have one database a local cache of the show information which doesn't need to be changed except when new data is added or old data changes. Then a simple list of shows that are saved in the list, also very lightweight... You're saving so much data in one place that when you add a show and it instantly writes to the file ( and I added a few shows in close proximity ) it gets overwhelmed.. But if it is a small list of show ids which is just what you "heart'ed / favorite'd" plus a small table with only which season + episode or just episode number if you count from 0-100 which changes you wouldn't run into this issue unless you added most of the shows ever created.

Hey, can you do the same thing for the "custom" ordering system that you did with bookmarklets?... IE allow javascript or some other rules to determine order... I have a lot of shows I've added that have hundreds of unseen episodes which I won't be getting to any time soon... Basically I want to order my list so that the lowest number of unseen episodes ( starting with a minimum of 1, ie 0 doesn't move to top and 2 would be under shows with 1 unseen episode ) starting with 1 to be at the top and descending down the list the unseen number goes up with 0 being "unsorted" or last overall...

I just hate scrolling through 30 shows with 100+ episodes each to get to the ones with 1 episode unseen and as soon as I click it, the dialog window closes to I have to keep scrolling each time I want to open a page...

If the dialog window would stay open or where you can select multiple episodes to open from multiple shows at the same time ( like the RSS feed reader where you can middle mouse click to select multiple "posts" and then click a button at the top of the dialog, outside of the listbox of news, to open all at once ) would also be nice.

 didn't add or remove anything but my entire database is gone!!!
It said over 2000 unwatched and I opened the list and it told me I needed to add tv shows so I restarted chrome and it said over 2000 and then reset.. I tried clicking load from cloud, but nothing is working...
all of them are gone???
Even my custom bookmarklet is gone

I logged in to Chrome on another PC to sync everything from my every-day pc to it... Instead of doing that.. TV Watchlist removed unknown number of shows and deleted the watch-history of countless others...

This is getting to the point where I'm considering becoming your competition.... Please fix these bugs; it isn't difficult to simplify watch-list data down to very little data consumption so it doesn't lag like hell when opening the list, or when marking episodes as watched....

Major issues that need to be fixed:
1 ) Data goes missing for no reason - sometimes during resync, other times for no apparent reason, other times for marking a show as watched too quickly, other times for adding too many shows at once ( 2 )...
2 ) Sync doesn't copy the NEWEST file ever - it should either not copy the data, or as it syncs, it should transfer shows without removing any, and mark episodes as watched without unmarking if you can't figure out how to properly sync...
3 ) Fix the backup / restore so it doesn't have all of the data in one text-box; add a zip download / upload option to reduce lag for those of us with a lot of shows we want to keep track of but don't have time to watch ( and simplify the dataset so this massive amount of data isn't used ).
4 ) Fix the text-box size for the bookmarklet - it is too small and I have to resize it numerous times before I can see my bookmarklet - because of how terrible the saving / reloading system is I may simply set the bookmarklet to load a script from my pc which I'll be able to edit much easier with ST3 or N++
5 ) Add Pin feature for the watch list so it doesn't close when you open an episode ( It takes forever to open despite the data being on SSD because of redundant data and too much data ) - by pinning it and only closing when the user wants to, we can easily open as many as we want ( I have been using OneTab to track episodes because of the terrible show-highlights page )!

6 ) Fix the show highlights page - It shows you a week worth starting on Sunday or Monday and when the next Sunday or Monday rolls around you lose 6 days of show info so you have to use the terrible drop-down.... Fix by adding user-config option to show how many episodes to display in the past and the future ( and make sure they're unseen - hide watched episodes although I believe it may already do this but I haven't paid much attention to it )...
Josh Moser
Josh
I lost so much data again!