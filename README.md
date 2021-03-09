# roostui
Roost visualization and annotation web interface


#### Steps to run on windows (needs python installed, python 2.xx is being discontinued support hence this readme will assume python 3.xx)
1. Clone the repo into your local
2. cd into folder with index.html
3. Start python http server like this on cmd in that folder : "python -m http. server 8000", default is 8000, change if needed
4. Navigate to the port on your localhost to visualize the web interface

#### Steps to put in a new feature
1. Clone repo to your local when you start initially
2. Create a new branch > new branches per user/per feature is recommended if there are multiple users working on the project  : git checkout -b test origin/test
3. Say your git CLI says there isn't a test branch, but you see one on the UI, do a git fetch, if there are updates to be fetched, do a git pull origin to get it synced. You will be able to checkout to the test branch now.
5. For every day of work it is recommended that we merge changes from the main branch to the local branch to be on top of code updates that have been approved in UAT and have been released in the main branch
6. It is recommended to commit all sorts of changes as long as the application is working so that we can go back to the previous versions as and when required
7. Rebasing with main can be done either with rebase or merge. First checkout the branch you want to work with. 
8. All changes to be deployed to UAT or main must have a relevant PR request associated with them, which would document approval and changes.
9. git push origin test to push. If the git checkout command is run well, the new branch remote will be synced to the local and the push will take place properly 
10. Setup your ssh repo as a remote repo like this : git remote add name_of_repository ssh://your_user@server_ip_address/path_to_git_directory
11. Once named, all updates can be pushed like this: git push name_of_repository test

