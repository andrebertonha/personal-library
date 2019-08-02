/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const helmet = require('helmet');
const mongoose = require('mongoose')

//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.use(helmet.noCache())
  app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))
    
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      mongoose.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (err, db) => {
        if(err) throw err
        db.collection('books').find().toArray((err, result) => {
          for(var i=0; i < result.length; i++) {
            // count each amount of comments from all books
            result[i].commentcount = result[i].comments.length;
            delete result[i].comments
          }
          //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
          res.json([result])
        })
      })
      
    })
    
    .post(function (req, res){
      var title = req.body.title;      
      //response will contain new book object including atleast _id and title
      var book = {        
        book_title: title,
        comments: []
      }
      mongoose.connect(MONGODB_CONNECTION_STRING, {useNewUrlParser: true}, (err, db) => {
        if(err) res.send({ message: 'database connection error', error: err })
        db.collection('books').insertOne(book, (err, bookInserted) => {
          if(err) res.send({ message: 'error inserting', error: err })
          res.json(book)
        })
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      var oid = new ObjectId(bookid)
      
      mongoose.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (err, db) => {
        db.collection('books').find({ _id: oid }).toArray((err, result) => {          
          if(result.length === 0) res.send('the book doesnt exists')          
          else res.json(result[0])
        })
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      
      var comment = req.body.comment;
      mongoose.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (err, db) => {
        db.collection('books').findOneAndUpdate(
          { _id: new ObjectId(req.params.id) },
          {$push: { comments: comment }},
          {new: true, upsert: false},          
          (err, result) => {
            if(err) throw err
            console.log(result)
            res.json(result.value);
          });
      })
      //json res format same as .get
    })
    
    .delete(function(req, res){      
      mongoose.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (err, db) => {
        db.collection('books').findOneAndDelete({
          _id: new ObjectId(req.params.id)
        }, (err, result) => {
          expect(err, 'database findOneAndDelete error').to.not.exist;
          expect(result, 'result error').to.exist;
          res.send('complete delete sucessfull')
        })
      })
      //if successful response will be 'delete successful'
    });
  
};
