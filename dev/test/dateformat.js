MX.kindle('dateformat', function(X, DateFormat) {
    
    test('MX.util.DateFormat', function() {
        
        equal(DateFormat.format(new Date(), 'Y-m-d'), '2013-03-29', 'format date Y-m-d');
        
        equal(DateFormat.format(DateFormat.parse('2013-03-29', 'Y-m-d'), 'Y-m-d'), '2013-03-29', 'parse string Y-m-d');
        
    });
    
});