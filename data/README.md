# Adding new data to the website

Deploying [roost-system](https://github.com/darkecology/roost-system) results in four types of outputs: radar `scans`, rendered `arrays`, deployment `logs`, and `ui`-required files. Typically, `scans` are deleted during deployment to save disk space once `arrays` are rendered. In addition, `slurm_logs` are saved if the deployment happens on a server that uses slurm to manage jobs.

1. Login to swarm which uses slurm. Go to the [roost-system](https://github.com/darkecology/roost-system) repo. Under `roost-system/tools`, modify arguments in `publish_images.sh`. Open a tmux session and run the script as follows to push dz05 and vr05 images in `ui/img`, which visualizes two radar channels and will be displayed in the UI, to doppler, where we host the website.

    ~~~ bash
    $ cd roost-system/tools
    $ bash publish_images.sh <dataset_name>
    ~~~

    Here <dataset_name> corresponds to the EXPERIMENT_NAME that we set when launching roost-system for inference and the <dataset_name> that will be displayed in the UI. 

    It is recommended to open more tmux sessions to scp `scans`, `logs`, and `slurm_logs` to some desired location on doppler (eg. /scratch2/wenlongzhao/roosts_deployment_outputs) for future reference. Further, `arrays` may be copied to `doppler:/scratch2/wenlongzhao/RadarNPZ` and used to construct new datasets.

2. Clone this roostui repo to your machine, if not already; otherwise pull the latest main branch.
Under `data`, modify arguments in `fetch.sh` and run it to pull the csv files in `ui/scans_and_tracks` from swarm. 

    ~~~ bash
    $ cd data
    $ bash fetch.sh <dataset_name>
    ~~~

    This will create a new directory `data/<dataset_name>` (if not already exist) with the csv files.

3. Initialize the dataset.

    ~~~ bash
    $ bash init_dataset.sh <dataset_name> # add optional prefix and suffix if needed
    ~~~
    
    This creates two files
    * `<dataset_name>/config.json`: configuration file
    * `<dataset_name>/batches.txt`: list of batches
    
    Edit these files if needed.

4. Edit the main UI config file `data/config.json` to add your dataset.

    ~~~ json
    {
        "datasets" : ["train", "greatlakes-2019", "greatlakes_test", "<dataset_name>"]
    }
    ~~~

5. Test the website locally. See [README in parent directory](../README.md). Usually this means running `yarn run serve` and then navigating to [http://localhost:8888]().

6. Push the website to doppler with the script `publish.sh` in the root directory of the repo.

    ~~~ bash
    $ bash publish.sh <website_name>
    ~~~
   
   We currently use `ui` as the <website_name>.

7. Commit and push your changes to github. `chmod` so that the directories on doppler can be modified by teammates. Clean files on swarm to prevent out of space errors in furture deployment.
