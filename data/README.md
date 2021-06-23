# Adding new data to the website

1. Login to swarm2 and use `tools/publish_images.sh` (from the [roost-system repo](https://github.com/darkecology/roost-system)) to push the images to doppler.

    ~~~ bash
    $ cd tools
    $ ./publish_images.sh <dataset_name>
    ~~~

    See the script for detailed usage. Usually only the experiment name argument is required.

2. Clone this repo and use `data/fetch.sh` to pull the csv files for the same experiment to your local machine. 

    ~~~ bash
    $ cd data
    $ ./fetch.sh <dataset_name>
    ~~~

    This will create a new directory `data/<dataset_name>` with the csv files.

3. Initialize the dataset:

    ~~~ bash
    $ ./init_dataset.sh <dataset_name> # add optional prefix and suffix
    ~~~
    
    This creates two files
    * `<dataset_name>/config.json`: configuration file
    * `<dataset_name>/batches.txt`: list of batches
    
    Edit these files if needed.

4. Edit the main UI config file `data/config.json` subdirectory to add your data set

    ~~~ json
    {
        "datasets" : ["train", "greatlakes-2019", "greatlakes_test", "<dataset_name>"]
    }
    ~~~

5. Test the website locally. See [README in parent directory](../README.md). Usually this means running `yarn run serve` and then navigating to [http://localhost:8888]().

6. Commit and push your changes, and push the website to dopper with the script `publish.sh` in the root directory of the repo.

    ~~~ bash
    $ git commit
    $ git push
    $ ./publish.sh
    ~~~
