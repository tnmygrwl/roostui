import sprintf from 'sprintf';

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
	var timestr = scan.substr(13, 6);
	var year = datestr.substr(0, 4);
	var month = datestr.substr(4, 2);
	var day = datestr.substr(6, 2);
	return {'scan': scan,
			'station': station,
			'date': datestr,
			'time': timestr,
			'year': year,
			'month': month,
			'day': day};
}

export function get_urls(scan, config) {

	var scan_fields = parse_scan(scan);

	var dz_url = sprintf(config["dz_url"]["pattern"],
						 config["dz_url"]["fields"].map( f => scan_fields[f]));

	
	var vr_url = sprintf(config["vr_url"]["pattern"],
						 config["vr_url"]["fields"].map( f => scan_fields[f]));
								
	return [dz_url, vr_url];
}
