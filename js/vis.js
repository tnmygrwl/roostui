import * as d3 from 'd3';
import sprintf from 'sprintf';
import $ from 'jquery'; 
import { parse_day, parse_time, parse_scan, get_urls, expand_pattern, obj2url, url2obj } from './utils.js';
import { BoolList } from './BoolList.js';

var UI = (function() {

	var UI = {};
	var days;					// BoolList of dates
	var frames;					// BoolList of frames for current day

	var scans;					// List of scans for selected "batch"
	var boxes;					// All boxes
	var boxes_by_day;           // Boxes grouped by day
	var tracks;					// All tracks
	var tracks_by_day;          // Tracks grouped by day

	var svgs;					// Top-level svg elements

	var config;                 // UI config
	var dataset_config;         // Dataset config info
	
	var nav = {
		"dataset" : "",
		"batch": "",
		"day": 0,
		"frame": 0
	};

	var labels = ['non-roost',
				  'swallow-roost',
				  'duplicate',
				  'other-roost',
				  'bad-track'];
	
	var default_filters = {
		"detections_min" : 2,
		"high_quality_detections_min" : 2,
		"score_min" : 0.05,
		"avg_score_min" : -1.0
	};

	var keymap = {
		'38': prev_day, // up
		'40': next_day, // down
		'37': prev_frame,	// left
		'39': next_frame   // right
	};

	var shift_keymap = {
		'38': prev_day_with_roost, // up
		'40': next_day_with_roost, // down
		'37': prev_frame_with_roost,	// left
		'39': next_frame_with_roost   // right
	};

	/* -----------------------------------------
	 * Class definitions
	 * ---------------------------------------- */

	/* -----------------------------------------
	 * Box
	 * ---------------------------------------- */
	class Box {
		constructor(obj) {
			obj && Object.assign(this, obj);

			this.setTrack( new Track({}));
		}

		setTrack(t) {
			this.track = t;
		}
	}
	
	/* -----------------------------------------
	 * Track
	 * ---------------------------------------- */
	class Track {
		constructor(obj) {
			obj && Object.assign(this, obj);
			this.nodes = new Map();
		}

		// Each SVG has a DOM element for the track
		setNode(n, svg) {
			this.nodes.set(svg, n);
		}

		setSelected() {
			Track.selectedTrack = this;
		}
		
		// Called when a user hovers
		//
		//   node = the bounding box that was hovered
		// 
		select(node) {

			// If this track is already selected, do nothing
			if (Track.selectedTrack && this == Track.selectedTrack) {
				window.clearTimeout(Track.unselectTimeout);
				return;
			}

			// If another track is selected, unselect it
			if (Track.selectedTrack) {
				Track.selectedTrack.unselect();
			}
			
			// Now continue selecting this track
			Track.selectedTrack = this;
			//console.log(Track.selectedTrack);

			// Add selected attribute to bounding box elements
			for (const node of this.nodes.values()) {
				d3.select(node).classed("selected", true);
			}

			// Display tooltip
			var tip = d3.select("#labeltip");
			
			tip.on("mouseenter", () => this.select(node) )
				.on("mouseleave", () => this.scheduleUnselect() );
				
			var bbox = d3.select(node).select("rect").node().getBoundingClientRect();
			//console.log(bbox);
			
			tip.style("visibility", "visible")
				.style("left", (bbox.x + bbox.width + 18) + "px")
				.style("top", bbox.y + (bbox.height/2) - 35+ "px");
			
			// Create radio buttons and labels
			var entering = tip.select("#labels").selectAll("span")
				.data(labels)
				.enter()
				.append("span");

			entering.append("input")
				.attr("id", (d,i) => "label" + i)
				.attr("type", "radio")
				.attr("name", "label")
				.attr("value", (d,i) => i);
				
			
			entering.append("label")
				.attr("for", (d,i) => "label" + i)
				.text((d,i) => sprintf("(%d) %s", i+1, d));
				
			

			
			entering.append("br");
			
			

			// Select the correct radio button
			tip.selectAll("input")
				.property("checked", (d, i) => d===this.label)
				.on("change", (d,i) => this.setLabel(i, d));

			
			// Enable keyboard shortcuts
			var zero_code = 48; // keycode for 0
			for(let i=0; i < labels.length; i++) {
				keymap[zero_code + parseInt(i+1)] =
					((i,label) => () => this.setLabel(i, label))(i, labels[i]);
			}
			keymap[9] = this.sendToBack; // tab: send to back

			// Create mapper link
			var box = d3.select(node).datum(); // the Box object
			var link = tip.select("#mapper")
				.html('<a href="#"> View on map</a>')
				.on("click", () => mapper(box));
			//console.log(box);
			
			var entering = tip.select("#notes").html('<input type="text" id="notestext" value="'+box.notes+'"> </input></br><input type="button" value="Save Notes" id="notes-save"></input>')
			.on("click", () => save_notes(box));
		}

		// Called when user unhovers to schedule unselection in 250ms
		scheduleUnselect = e => {
			Track.unselectTimeout = window.setTimeout(this.unselect, 250);
		}

		sendToBack = e => {
			for (const node of this.nodes.values()) {
				d3.select(node).lower();
			}
		}
		
		unselect = e => {

			// The track may have already been unselected. If so, return
			if (Track.selectedTrack !== this) {
				return;
			}

			// Remove selected class from elements
			for (const node of this.nodes.values()) {
				d3.select(node).classed("selected", false);
			}
			
			// Disable tooltip
			var tip = d3.select("#labeltip");
			tip.style("visibility", "hidden");
			
			// Disable keyboard shortcuts
			var zero_code = 48; // keycode for 0
			for(let i=0; i < labels.length; i++) {
				delete keymap[zero_code + parseInt(i+1)];
			}

			Track.selectedTrack = null;

		}

		setLabel(label_id, label) {
			var label_id_n;
			if(!Number.isInteger(label_id)){
				label_id_n = labels.indexOf(label_id);
			}
			else{label_id_n = labels.indexOf(label);}
			d3.select("#label"+label_id_n).node().checked = true;	
			if(!Number.isInteger(label_id)){
				this.label = label_id;
			}
			else{this.label = labels[label_id];}
			
			this.user_labeled = true;
			
			for (const node of this.nodes.values()) {
				d3.select(node).classed("filtered", this.label !== 'swallow-roost');
			}
			
			// Send to back after setting label?
			// this.sendToBack();
			
			// Warn before closing window
			window.onbeforeunload = function() {
				return true;
			};
		}
	}
	Track.selectedTrack = null;
	Track.unselectTimeout = null;

	/* -----------------------------------------
	 * UI
	 * ---------------------------------------- */

	// Function on every page load
	UI.init = function(data)
	{
		config = data;

		svgs = d3.selectAll("#svg1, #svg2");
				
		// Populate data and set event handlers	
		d3.select("#export").on("click", export_sequences);
		d3.select("#notes-save").on("click", save_notes);
		d3.select('body').on('keydown', handle_keydown);

		// Populate datasets
		var datasets = d3.select('#datasets');
		var options = datasets.selectAll("options")
			.data(config['datasets'])
			.enter()
			.append("option")
			.text(d => d);
		
		datasets.on("change", change_dataset);
		set_filters(default_filters);

		let url_nav = url2obj(window.location.hash.substring(1));
		Object.assign(nav, url_nav);
		
		render_dataset();
	};


	function handle_keydown(e) {
		var tagName = d3.select(e.target).node().tagName;
		if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
			return;
		}
		var code = e.keyCode;
		var map = e.shiftKey ? shift_keymap : keymap;
		if (code in map) {
			e.preventDefault();
			e.stopPropagation();
			map[code]();
		}
	}

	function unique(a) {
		return [...new Set(a)];
	}
	
	function save_notes(box)
	{
		box.notes = document.getElementById('notestext').value;
		box.user_labeled = true;
	}
	

	/* -----------------------------------------
	 * Filtering
	 * ---------------------------------------- */

	function enable_filtering() {
		d3.selectAll("#detections_min, #high_quality_detections_min, #score_min, #avg_score_min")
			.on("change", change_filter);
	}

	function change_filter(d, i, nodes) {
		update_tracks();
		render_frame();
	}

	function set_filters(data) {
		for (var key in default_filters) {
			var val = key in data ? data[key] : default_filters[key];
			document.getElementById(key).value = val;
		}
	}

	
	/* -----------------------------------------
	 * Page navigation and rendering
	 * ---------------------------------------- */

	/* -----------------------------------------
	 * 1. Dataset
	 * ---------------------------------------- */
	
	function change_dataset() {
		let datasets = d3.select('#datasets').node();
		datasets.blur();
		nav.dataset = datasets.value;
		nav.day = 0;
		render_dataset();
	}
	
	function render_dataset() {
		// If work needs saving, check if user wants to proceed
		if (window.onbeforeunload) {
			if (! window.confirm("Change dataset? You made changes but did not export data.")) {
				return; 
			}
		}
		
		let dataset = nav.dataset;
		if (dataset) {

			d3.select('#datasets').node().value = dataset;

			function handle_config(_config) {
				dataset_config = _config;		
				if ("filtering" in dataset_config) {
					set_filters(dataset_config["filtering"]);
				}
				else {
					set_filters(default_filters);
				}
			}

			function handle_batches(batch_list)
			{
				batch_list = batch_list.trim().split("\n");			
				var batches = d3.select('#batches');		
				var options = batches.selectAll("option")
					.data(batch_list)
					.join("option")
					.text(d => d);
				batches.on("change", change_batch);
			}
			
			var batchFile = sprintf("data/%s/batches.txt", dataset);		
			var dataset_config_file = sprintf("data/%s/config.json", dataset);
			
			Promise.all([
				d3.text(batchFile).then(handle_batches),
				d3.json(dataset_config_file).then(handle_config)
			]).then( change_batch );
		}
	}
	

	/* -----------------------------------------
	 * 2. Batch
	 * ---------------------------------------- */

	function change_batch() {
		let batches = d3.select('#batches').node();
		batches.blur();
		nav.batch = batches.value;
		render_batch();
	}

	function render_batch() {

		if (window.onbeforeunload) {
			if (! window.confirm("Change batches? You made changes but did not export data.")) {
				return; 
			}
		}

		if (nav.batch) {

			d3.select('#batches').node().value = nav.batch;
			
			var csv_file = expand_pattern(dataset_config["boxes"], nav);
			var scans_file = expand_pattern(dataset_config["scans"], nav);
			
			function handle_scans(scan_list) {				
				scan_list = scan_list.trim().split("\n");
				
				// filter scan list to current batch if specified in dataset_config
				if ("filter" in dataset_config["scans"])
				{
					scan_list = scan_list.filter( 
						d => expand_pattern(dataset_config["scans"]["filter"], parse_scan(d)) == nav.batch
					);
				}

				// group scans by day
				scans = d3.group(scan_list, (d) => parse_scan(d)['date']);
			}

			// convert a row of the csv file into Box object
			function row2box(d) {
				let info = parse_scan(d.filename);
				d.station = info['station'];
				d.date = info['date'];
				d.time = info['time'];
				if("swap" in dataset_config && dataset_config["swap"]){
					let tmp = d.y;
					d.y = d.x;
					d.x = tmp;
				}		
				return new Box(d);
			}

			// Load boxes and create tracks when new batch is selected
			function handle_boxes(_boxes) {		
				boxes = _boxes;
				boxes_by_day = d3.group(boxes, d => d.date);

				let summarizer = function(v) { // v is the list of boxes for one track
					let date = v[0].date;
					let length = v.length;
					let tot_score = d3.sum(v, d => d.det_score);
					let avg_score = tot_score / length;
					return new Track({
						date: v[0].date,
						length: v.length,
						tot_score: tot_score,
						avg_score: avg_score,
						user_labeled: false,
						viewed: false
					});
				};
				
				tracks = d3.rollup(boxes, summarizer, d => d.track_id);

				// Link boxes to their tracks
				for (var box of boxes) {
					box.track = tracks.get(box.track_id);
				}
				update_tracks(); // add attributes that depend on user input
			}
			
			// Load scans and boxes
			Promise.all([
				d3.text(scans_file).then(handle_scans),
				d3.csv(csv_file, row2box).then(handle_boxes)
			]).then( () => {

				enable_filtering();
				
				days = new BoolList(scans.keys(), boxes_by_day.keys());
				
				var dateSelect = d3.select("#dateSelect");
				var options = dateSelect.selectAll("option")
					.data(days.items);

				options.enter()
					.append("option")
					.merge(options)
					.attr("value", (d,i) => i)
					.text(function(d, i) {
						var str = parse_day(d);
						return days.isTrue(i) ? str : "(" + str + ")";
					});

				options.exit().remove();
				
				dateSelect.on("change", change_day);

				render_day();
			});
		}
	}

	// Compute track attributes that depend on user input
	function update_tracks() {

		let score_min = +d3.select("#score_min").node().value;

		let summarizer = function(v) { // v is the list of boxes for one track
			let n_high_quality = v.filter(d => d.det_score >= score_min).length;
			return n_high_quality;
		};
		
		let n_high_quality = d3.rollup(boxes, summarizer, d => d.track_id);

		// Default labeling based on user filtering
		let detections_min = +d3.select("#detections_min").node().value;
		let high_quality_detections_min = +d3.select("#high_quality_detections_min").node().value;
		let avg_score_min = +d3.select("#avg_score_min").node().value;
		
		for (let [id, t] of tracks) {

			if (t.user_labeled)
			{
				continue;		// don't override a user-entered label
			}

			// Automatic labeling based on filtered rools 
			if (t.length < detections_min ||
				n_high_quality.get(id) < high_quality_detections_min ||
				t.avg_score < avg_score_min )
			{
				t.label = 'non-roost';
			}
			else
			{
				t.label = 'swallow-roost';
			}
		}
	}

	
	/* -----------------------------------------
	 * 3. Day
	 * ---------------------------------------- */

	function change_day() {
		let n = d3.select("#dateSelect").node();
		n.blur();
		nav.day = n.value;
		render_day();
	}
	
	function prev_day() {
		if (days.prev()) update_nav_then_render_day();
	}

	function prev_day_with_roost() {
		if (days.prevTrue()) update_nav_then_render_day();
	}

	function next_day() {
		if (days.next()) update_nav_then_render_day();
	}

	function next_day_with_roost() {
		if (days.nextTrue()) update_nav_then_render_day();
	}

	function update_nav_then_render_day() {
		nav.day = days.currentInd;
		nav.frame = 0;
		render_day();
	}
	
	function render_day() {

		if(!days) return;

		days.currentInd = nav.day;
		d3.select("#dateSelect").property("value", days.currentInd);
				
		var day_key = days.currentItem; // string representation of date
		
		var allframes = scans.get(day_key); // list of scans
		var frames_with_roosts = [];
		if (boxes_by_day.has(day_key)) {
			frames_with_roosts =  boxes_by_day.get(day_key).map(d => d.filename);
		}

		frames = new BoolList(allframes, frames_with_roosts);

		var timeSelect = d3.select("#timeSelect");
		
		var options = timeSelect.selectAll("option")
			.data(frames.items);

		options.enter()
			.append("option")
			.merge(options)
			.attr("value", (d,i) => i)
			.text(d => parse_time(parse_scan(d)['time']));

		options.exit().remove();
		
		timeSelect.on("change", () => {
			var n = timeSelect.node();
			n.blur();
			frames.currentInd = n.value;
			render_frame();
		});
		
		render_frame();
	}

	
	/* -----------------------------------------
	 * 4. Frame
	 * ---------------------------------------- */

	function prev_frame() {
		if (frames.prev()) update_nav_then_render_frame();
	}

	function next_frame() {
		if (frames.next()) update_nav_then_render_frame();
	}

	function prev_frame_with_roost() {
		if (frames.prevTrue()) update_nav_then_render_frame();
	}

	function next_frame_with_roost() {
		if (frames.nextTrue()) update_nav_then_render_frame();
	}

	function update_nav_then_render_frame() {
		nav.frame = frames.currentInd;
		render_frame();
	}

	function mapper(box) {
		var ll = box.lat + "," + box.lon;
		var url = "http://maps.google.com/?q=" + ll + "&ll=" + ll + "&z=8";
		//var url = "http://www.google.com/maps/search/?api=1&query=" + ll + "&zoom=8&basemap=satellite";
		window.open(url);
	}

	function render_frame()
	{
		if(!days) return;

		if (Track.selectedTrack) {
			Track.selectedTrack.unselect();
		}

		var day = days.currentItem;		

		frames.currentInd = nav.frame;
		d3.select("#timeSelect").property("value", frames.currentInd);
				
		var scan = frames.currentItem;
		
		var urls = get_urls(scan, dataset_config);
		d3.select("#img1").attr("src", urls[0]);
		d3.select("#img2").attr("src", urls[1]);

		let boxes_for_day = boxes_by_day.has(day) ? boxes_by_day.get(day) : [];
		let boxes_for_scan = boxes_for_day.filter(d => d.filename.trim() == scan.trim());
		var track_ids = boxes_for_day.map((d) => d.track_id);
		track_ids = unique(track_ids);

		// Create color map from track_ids to ordinal color scale
		var myColor = d3.scaleOrdinal().domain(track_ids)
			.range(d3.schemeSet1);

		var scale = 1.2;
		var groups = svgs.selectAll("g")
			.data(boxes_for_scan, (d) => d.track_id);

		groups.exit().remove();
		
		// For entering groups, create elements
		var entering = groups.enter()
			.append("g")
			.attr("class", "bbox");
		entering.append("rect");
		entering.append("text");

		// Register each new DOM element with the track and mark the track as viewed
		entering.each( function(d) {
			d.track.setNode(this, this.parentNode);
			d.track.viewed = true;
			d.track.originallabel = d.track.label;
			if(typeof d.notes !== 'undefined'){
				d.track.originalnotes = d.notes;
			}
			else{
				d.notes = "";
				d.track.originalnotes = "";
			}
		});
		
		// Merge existing groups with entering ones
		groups = entering.merge(groups);
		
		// Set handlers for group
		groups.classed("filtered", (d) => d.track.label !== 'swallow-roost')
			.on("mouseenter", function (e,d) { d.track.select(this); } )
			.on("mouseleave", (e,d) => d.track.scheduleUnselect() );
		
		// Set attributes for boxes
		groups.select("rect")
		 	.attr("x", b => b.x - scale*b.r)
			.attr("y", b => b.y - scale*b.r)
		 	.attr("width", b => 2*scale*b.r)
		 	.attr("height", b => 2*scale*b.r)
			.attr("stroke", d => myColor(d.track_id))
			.attr("fill", "none");
		//.on("click", mapper)

		// Set attributes for text
		groups.select("text")
		 	.attr("x", b => b.x - scale*b.r + 5)
			.attr("y", b => b.y - scale*b.r - 5)
		 	.text(b => b.track_id + ": " + b.det_score);		
		
		//var newUrl=(window.location.href.split("?")[0].concat("?").concat(datasets.value).concat("&").concat(frames.currentItem.substr(0,8)).concat("&").concat(frames.currentItem));
		//history.replaceState({}, null, newUrl);
		window.location.hash = obj2url(nav);
		
	}	

	
	/* -----------------------------------------
	 * 5. Export
	 * ---------------------------------------- */
	
	function export_sequences() {

		let box_cols = Object.keys(boxes[0]).filter( val => val !== "track");
		let track_cols = ["length", "tot_score", "avg_score", "viewed", "user_labeled", "label","originallabel","originalnotes"];
		
									 
		// Assign desired track cols to box
		for (var box of boxes) {
			var track = tracks.get(box.track_id);
			for (var col of track_cols) {
				box[col] = track[col];
			}
		}

		let cols = box_cols.concat(track_cols);
		
		let dataStr = d3.csvFormat(boxes, cols);
		let dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(dataStr);
		
		let filename = sprintf("roost_labels_%s.csv", $("#batches").val());

		let linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', filename);
		linkElement.click();
		
		// Remove warning about export
		window.onbeforeunload = null;
	}

	return UI;
}());


d3.json('data/config.json').then(UI.init);
