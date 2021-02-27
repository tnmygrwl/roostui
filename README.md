# roostui
Roost visualization and annotation web interface


#### Steps to run on windows (needs python installed, python 2.xx is being discontinued support hence this readme will assume python 3.xx)
1. Clone the repo into your local
2. cd into folder with index.html
3. Start python http server like this on cmd in that folder : "python -m http. server 8000", default is 8000, change if needed
4. Navigate to the port on your localhost to visualize the web interface

#### Steps to put in a new feature
1. Create a new branch > new branches per user/per feature is recommended if there are multiple users working on the project
2. Clone branch to your local when you start initially
3. For every day of work it is recommended that we merge changes from the main branch to the local branch to be on top of code updates that have been approved in UAT and have been released in the main branch
4. It is recommended to commit all sorts of changes as long as the application is working so that we can go back to the previous versions as and when required
5. Rebasing with main can be done either with rebase or merge. First checkout the branch you want to work with. 
6. All changes to be deployed to UAT or main must have a relevant PR request associated with them, which would document approval and changes.

