const request = require('request');

var getSession = function(callback) {
    var options = {
        method: 'GET',
        url: 'http://mis.twse.com.tw/stock/fibest.jsp',
        qs: {
            lang: 'zh_tw',
        },
        jar: true
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log(error);
            return;
        }

		if (callback)
			callback();
    });
}

var getStockInfoTwseImpl = function(ex_ch, callback) {
	var options = {
        method: 'GET',
        url: 'http://mis.twse.com.tw/stock/api/getStockInfo.jsp',
        qs: {
            ex_ch: ex_ch,
            json: '1',
            delay: '0',
            _: new Date().getTime()
        },
        jar: true
    };
	
	request(options, function(error, response, body) {
		if (error) {
            console.log(error, body);
			callback(null);
			return;
        }
		
		var mshArray;
		try {
			msgArray = JSON.parse(body).msgArray;
		} catch (e) {
			console.log('invalid msgArray');
            console.log(e, body);
			callback(null);
			return;
		}

		if (!msgArray || msgArray.length == 0) {
			console.log('invalid msgArray');
            console.log(error, body);
			callback(null);
			return;
		}

		var stock = msgArray[0];
		var values = {};

		if (stock.t) values.t = stock.t;
		if (stock.d) values.d = stock.d;
		if (stock.c) values.no = stock.c;

		if (values.no == 't00')
			values.n = '加權指數';
		else if (values.no == 't13')
			values.n = '電子指數';
		else if (values.no == 't17')
			values.n = '金融指數';
		else if (stock.n)
			values.n = stock.n;

		if (stock.ex) values.ex = stock.ex;
		if (stock.ch) values.ch = stock.ch;
		if (stock.y) values.y = parseFloat(stock.y);
		if (stock.l) values.l = parseFloat(stock.l);
		if (stock.h) values.h = parseFloat(stock.h);
		if (stock.z) values.p = parseFloat(stock.z);
		if (stock.o) values.o = parseFloat(stock.o);
		if (stock.u) values.max = parseFloat(stock.u);
		if (stock.w) values.min = parseFloat(stock.w);
		if (stock.tv && !isNaN(parseInt(stock.tv)))
			values.v = parseInt(stock.tv);
		if (stock.v && !isNaN(parseInt(stock.v)))
			values.tv = parseInt(stock.v);

		if (stock.a && stock.a != '-') {
			arr = stock.a.split('_');
			values.sp = [];
			for (var j = 0; j < 5; j++) {
				if (!isNaN(parseFloat(arr[j])))
					values.sp.push(parseFloat(arr[j]));
			}
		}

		if (stock.f && stock.f != '-') {
			arr = stock.f.split('_');
			values.sv = [];
			for (var j = 0; j < 5; j++) {
				if (!isNaN(parseInt(arr[j])))
					values.sv.push(parseInt(arr[j]));
			}
		}

		if (stock.b && stock.b != '-') {
			arr = stock.b.split('_');
			values.bp = [];
			for (var j = 0; j < 5; j++) {
				if (!isNaN(parseFloat(arr[j])))
					values.bp.push(parseFloat(arr[j]));
			}
		}

		if (stock.g && stock.g != '-') {
			arr = stock.g.split('_');
			values.bv = [];
			for (var j = 0; j < 5; j++) {
				if (!isNaN(parseInt(arr[j])))
					values.bv.push(parseInt(arr[j]));
			}
		}

		// callback
		callback(values);
    });
};

var query = function(ex_ch, callback) {
	getSession(function() {
		getStockInfoTwseImpl(ex_ch, ret => {
			callback(ret);
		});
	});
};
exports.query = query;

query('tse_t00.tw', ret => {
	console.log(ret);
});
