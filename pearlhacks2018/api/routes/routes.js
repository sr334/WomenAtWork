'use strict';
module.exports = function (app) {
    var todoList = require('../controllers/controller');
    var LINQ = require("node-linq").LINQ;
    const cheerio = require('cheerio');
    const syncrequest = require('sync-request');
    const fs = require('fs');
    const path = require('path');
    const currentDir = path.join(__dirname);
    app.get('/', (req, res) => { res.render("index"); });

    app.get('/refreshCountryData', (req, res) => {
        // 
        var request = require("request");

        var options = {
            method: 'GET',
            url: 'https://www.forbes.com/ajax/list/data',
            qs: { year: '2017', uri: 'global2000', type: 'organization' },
            headers:
                {
                    'Postman-Token': 'aca21afa-d54d-c1f7-63d6-571db7aa0ca3',
                    'Cache-Control': 'no-cache'
                }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            // console.log(body);
            let countryData = JSON.parse(body); //creates array of objects
            var arr = new LINQ(countryData)//.OrdersBy(function(country) {return country.joined;})
                .Where(function (country) { return country.country == "United States" })
                .OrderBy(function (country) { return country.rank })
                .ToArray();
            arr = arr.slice(0, 50); //get first 10
            for (let countryOI of arr) {
                if (countryOI.uri && countryOI.uri != "") {
                    let URL = "https://www.inhersight.com/company/" + countryOI.uri;
                    var filePart = syncrequest('GET', URL);
                    console.log(URL);
                    // console.log("Data ", filePart.getBody('utf8').toString());
                    try {
                        let fileData = filePart.getBody('utf8').toString();
                        let companyRatingHTML = cheerio.load(fileData);
                        // let indexesToCrawl = ["0","3","6",""];
                        for (let i = 0; i < 43; i += 3) {
                            let companyRatingHTMLKEY = companyRatingHTML('#ratings .frame-950 .clearfix .col').eq(i)
                                // .eq(i+1)
                                .html().toString().trim();//.length;
                            let companyRatingHTMLVal = companyRatingHTML('#ratings .frame-950 .clearfix .col').eq(i + 1)
                                // .eq(i+1)
                                .html().toString().trim();//.length;
                            if (companyRatingHTMLKEY && companyRatingHTMLKEY != "") {
                                countryOI[companyRatingHTMLKEY.toLowerCase().replaceAll(" ", "_")] = companyRatingHTMLVal;
                            }
                            // console.log(companyRatingHTMLI);
                        }

                        countryOI.forbes_rank = countryOI.rank;
                        
                        

                        fs.writeFile(currentDir + '/../../data/countryData.json', JSON.stringify(arr), (err) => {
                            if (err) throw err;
                            console.log('The file has been saved!');
                        });


                    } catch (e) {
                        console.error("Err : ", e)
                        //toLowerCase()
                        //.replaceAll()
                    }
                }
            }
            res.send(arr);
        });

    });

    app.get('/getCountryData', (req, res) => {
        try {
            delete require.cache[require.resolve('../../data/countryData')];
            let companyData = require('../../data/countryData');
            res.send(companyData);
        } catch (e) {
           res.send({ error: "No data found. Please run update json." });
        }
    });
};

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

