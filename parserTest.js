var parser =  require('./subparser');

console.log();
parser.parseASS('/home/vigliag/Desktop/test.ass', function(err,lines){
	console.log(lines);
});