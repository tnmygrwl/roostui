
describe("Utils", function() {

  describe("This will check if the util functions work well", function() {
    beforeEach(function() {
      
    });

    it("parse day", function() {
	  var date = new Date(Date.UTC("2021", "2", "15"));
	  var datestr = date.toLocaleDateString('en-US', { timeZone: 'UTC' });;
      expect(parse_day("20210315")).toEqual(datestr);
    });
	
	it("parse time", function() {
      expect(parse_time("202020")).toEqual("20:20:20 UTC");
    });
	
	it("parse scan", function() {
	  var c = {'station': "1996", 'date': '20210315', 'time': '202020'}
      expect(parse_scan("199620210315 202020")).toEqual(c);
    });
  });



});
