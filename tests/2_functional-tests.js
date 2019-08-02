/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  
  test('Assyncronous test #example', function(done) {
    setTimeout(function(){
      assert.isOk('Async test!')
      done()
    }, 500)
  })
  
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {

    var testid
    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .end((err, res) => {
              assert.equal(res.status, 200)
              assert.property(res.body, 'comments', 'book should contain comments')
              assert.isArray(res.body.comments, 'comments should be an array')
              assert.property(res.body, 'title', 'book should contain a title')
              assert.property(res.body, '_id', 'book should contain _id')
              assert.equal(res.body.title, 'My Test Book')
              done()
           })        
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'missing title')
            done()
        })
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .post('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.isArray(res.body, 'response should be an array')
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount')
            assert.property(res.body[0], 'title', 'Books in array should contain title')
            assert.property(res.body[0], '_id', 'Books in array should contain _id')
            testid = res.body[0]._id
            done()
        })
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/123412341234')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')
        })
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
        .get('/api/books/'+testid)
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.property(res.body, 'comments', 'Book should contain comments');
          assert.isArray(res.body.comments, 'Comments should be an array')
          assert.property(res.body, 'title', 'Book should contain title');
          assert.property(res.body, '_id', 'Book should contain _id');
          assert.equal(res.body._id, testid);
          done();
        })          
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
        .post('/api/books/'+testid)
        .send({ comment: 'test comment' })
        .end((err, result) => {
          assert.equal(result.status, 200)
          assert.property(result.body, 'comments', 'Book should contain comments');
          assert.isArray(result.body.comments, 'Comments should be an array');
          assert.include(result.body.comments, 'test comment', 'Comments should include test comment submitted');
          assert.property(result.body, 'title', 'Book should contain title');
          assert.property(result.body, '_id', 'Book should contain _id');
          done();
        })
      });
      
    });

  });

});
