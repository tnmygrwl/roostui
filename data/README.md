# Adding new data to the website

1. Login to swarm. Go to the [roost-system](https://github.com/darkecology/roost-system) repo. Under `roost-system/tools`, modify arguments in `publish_images.sh`. Run it in a tmux session to push the images to doppler as follows.

    ~~~ bash
    $ cd roost-system/tools
    $ bash publish_images.sh <dataset_name>
    ~~~

    Here <dataset_name> corresponds to the EXPERIMENT_NAME that we set when launching roost-system for inference and the <dataset_name> that will be displayed in the UI. Optionally, scp the slurm logs to some desired location on doppler for the record.

2. Clone this roostui repo to your machine. 
Under `data`, modify arguments in `fetch.sh` and run it to pull the csv files for the same experiment from swarm. 

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

7. Commit and push your changes to github. 
