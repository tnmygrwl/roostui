import sprintf from 'sprintf';

export function obj2url(obj) {
	var str = Object.keys(obj).map(function(key) {
		return key + '=' + obj[key];
	}).join('&');
	return str;
}

export function url2obj(str) {
	var result = str.split('&').reduce(
		(res, item) => {
			var parts = item.split('=');
			res[parts[0]] = parts[1];
			return res;
		},
		{});
}

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
			'year': parseInt(year),
			'month': parseInt(month),
			'day': parseInt(day)};
}

export function get_urls(scan, config) {

	var scan_fields = parse_scan(scan);

	var dz = expand_pattern(config["dz"], scan_fields);
	var vr = expand_pattern(config["vr"], scan_fields);
	
	return [dz, vr];
}

export function expand_pattern(spec, data) {

	var pattern, fields;

	/*
	  spec looks like one of the following
	  
	  spec = { 
	     "pattern" : <sprintf like pattern>
		 "fields" : <list of field names>
	  }

	  spec = [<pattern>, <fieldnames>]
	 */
	
	if ("pattern" in spec) {	// dict form
		pattern = spec["pattern"];
		fields = spec["fields"];
	}
	else						// array form
	{
		pattern = spec[0];
		fields = spec[1];
	}

	var values = fields.map( k => data[k] );
	return sprintf(pattern, ...values);
}
