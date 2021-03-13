
	export function parse_day(day) {
		var y  = day.substr(0,4);
		var m  = day.substr(4,2) - 1;
		var d  = day.substr(6,2);
		
		var date = new Date(Date.UTC(y, m, d));
		var datestr = date.toLocaleDateString('en-US', { timeZone: 'UTC' });
		return datestr;
	}

	export function parse_time(timestr) {		
		var hour   = timestr.substr(0,2);
		var minute = timestr.substr(2,2);
		var second = timestr.substr(4,2);
		return hour + ':' + minute + ':' + second + ' UTC';
	}

	export function parse_scan(scan) {
		var station = scan.substr(0, 4);
		var datestr = scan.substr(4, 8);
		var timestr = scan.substr(13,6);
		return {'station': station, 'date': datestr, 'time': timestr};
	}

	export function get_urls(scan) {
		var dz_url = "https://maxwell.cs.umass.edu/roost-label/all_east_scans_results_split/birdcast_1995_2018/ref1_image/" + scan + ".png";
		var vr_url = "https://maxwell.cs.umass.edu/roost-label/all_east_scans_results_split/birdcast_1995_2018/rv1_image/" + scan + ".png";
		return [dz_url, vr_url];
	}