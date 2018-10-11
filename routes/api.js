/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

// Create an issue schema
let issueSchema = mongoose.Schema({
  project: String,
  issue_title: String,
  issue_text: String,
  created_by: String,
  assigned_to: String,
  status_text: String,
  created_on: Date,
  updated_on: Date,
  open: Boolean
});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;

      // Connect to databse
      mongoose.connect(CONNECTION_STRING);
      let db = mongoose.connection;
    
      db.once('open', () => {                
        // Create an issue model
        let issueModel = mongoose.model('issue', issueSchema);
        
        // Create filter
        let issueFilter = { project: project };
                
        // Add filter params
        if (req.query.hasOwnProperty('issue_title')) issueFilter.issue_title = req.query.issue_title;
        if (req.query.hasOwnProperty('issue_text')) issueFilter.issue_text = req.query.issue_text;
        if (req.query.hasOwnProperty('created_by')) issueFilter.created_by = req.query.created_by;
        if (req.query.hasOwnProperty('assigned_to')) issueFilter.assigned_to = req.query.assigned_to;
        if (req.query.hasOwnProperty('status_text')) issueFilter.status_text = req.query.status_text;
        if (req.query.hasOwnProperty('open')) issueFilter.open = req.query.open;
                
        // Get issues
        issueModel.find(issueFilter, (err, issues) => {
          // Add issue to list
          let issueList = [];
          issues.forEach(issue => {
            issueList.push({
              project: issue.project,
              issue_title: issue.issue_title,
              issue_text: issue.issue_text,
              created_by: issue.created_by,
              assigned_to: issue.assigned_to,
              status_text: issue.status_text,
              created_on: issue.created_on,
              updated_on: issue.updated_on,
              open: issue.open,
              _id: issue._id
            });
          });
                    
          // Send issue list
          res.json(issueList);
          return;
        });        
      });      
    })
    
    .post(function (req, res){
      var project = req.params.project;
            
      // Check for required params
      if (!req.body.hasOwnProperty('issue_title') || !req.body.hasOwnProperty('issue_text') || !req.body.hasOwnProperty('created_by')) {
        // Send error
        res.send('missing required fields');
        return;
      }
      
      // Connect to databse
      mongoose.connect(CONNECTION_STRING);
      let db = mongoose.connection;
    
      db.once('open', () => {
        // Create an issue model
        let issueModel = mongoose.model('issue', issueSchema);
                
        // Create an issue
        let timeNow = Date.now();
        let issue = new issueModel({
          project: project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to ? req.body.assigned_to : '',
          status_text: req.body.status_text ? req.body.status_text : '',
          created_on: timeNow,
          updated_on: timeNow,
          open: true
        });
                
        // Save issue
        issue.save((err, issue) => {          
          // Send issue
          res.json({
            project: project,
            issue_title: issue.issue_title,
            issue_text: issue.issue_text,
            created_by: issue.created_by,
            assigned_to: issue.assigned_to,
            status_text: issue.status_text,
            created_on: issue.created_on,
            updated_on: issue.updated_on,
            open: issue.open,
            _id: issue._id
          });
          return;
        });        
      });
    })
    
    .put(function (req, res){
      let putItems = {};
      var project = req.params.project;
          
      // Get params
      if (req.body.hasOwnProperty('issue_title')) putItems.issue_title = req.body.issue_title;
      if (req.body.hasOwnProperty('issue_text')) putItems.issue_text = req.body.issue_text;
      if (req.body.hasOwnProperty('created_by')) putItems.created_by = req.body.created_by;
      if (req.body.hasOwnProperty('assigned_to')) putItems.assigned_to = req.body.assigned_to;
      if (req.body.hasOwnProperty('status_text')) putItems.status_text = req.body.status_text;
      if (req.body.hasOwnProperty('open')) putItems.open = req.body.open;
    
      // Check if empty
      if (Object.keys(putItems).length === 0) {        
        // Send error
        res.send('no updated field sent');
        return;
      }
    
      // Add updated time
      putItems.updated_on = Date.now();
    
      // Connect to databse
      mongoose.connect(CONNECTION_STRING);
      let db = mongoose.connection;
    
      db.once('open', () => {        
        // Create an issue model
        let issueModel = mongoose.model('issue', issueSchema);
        
        // Find and update matching id
        issueModel.findByIdAndUpdate(req.body._id, putItems, (err, issue) => {
          // Check if nothing found
          if(!issue) {
            res.send('could not update ' + req.body._id);
            return;
          }
          
          res.send('successfully updated ' + req.body._id);
          return;
        });
      });      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      
      // Check for id
      if (!req.body.hasOwnProperty('_id')) {
        // Send error
        res.send('_id error');
        return;
      }
    
      // Connect to databse
      mongoose.connect(CONNECTION_STRING);
      let db = mongoose.connection;
    
      db.once('open', () => {        
        // Create an issue model
        let issueModel = mongoose.model('issue', issueSchema);
        
        // Find and delete matching id
        issueModel.findByIdAndRemove(req.body._id, (err, issue) => {
          // Check if nothing found
          if(!issue) {
            res.send('could not delete ' + req.body._id);
            return;
          }
          
          res.send('deleted ' + req.body._id);
          return;
        });
      });    
    });
};
