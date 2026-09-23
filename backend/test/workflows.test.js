import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Journal from '../src/models/Journal.js';
import Article from '../src/models/Article.js';
import Client from '../src/models/Client.js';
import AuthorshipSale from '../src/models/AuthorshipSale.js';

const id = () => new mongoose.Types.ObjectId();

test('journal catalog requires title, ISSN and web URL', () => {
  const valid = new Journal({name:'Test Journal',issn:'1234-5678',webUrl:'https://example.test'});
  assert.equal(valid.validateSync(),undefined);
  const invalid = new Journal({name:'Test Journal',issn:'1234-5678'});
  assert.ok(invalid.validateSync()?.errors.webUrl);
});

test('article catalog creates a bounded total position range', () => {
  const valid = new Article({title:'Article',journal:id(),issn:'1234-5678',webUrl:'https://example.test/article',totalPOS:8,availablePOS:8});
  assert.equal(valid.validateSync(),undefined);
  const invalid = new Article({title:'Article',journal:id(),issn:'1234-5678',webUrl:'https://example.test/article',totalPOS:0});
  assert.ok(invalid.validateSync()?.errors.totalPOS);
});

test('client business type only permits B-B and B-C', () => {
  assert.equal(new Client({clientName:'Client',businessType:'B-B',createdBy:id()}).validateSync(),undefined);
  assert.ok(new Client({clientName:'Client',businessType:'Other',createdBy:id()}).validateSync()?.errors.businessType);
});

test('authorship sale records exact author position details', () => {
  const sale = new AuthorshipSale({
    saleNo:'AS-TEST',journal:id(),article:id(),vendor:id(),createdBy:id(),numberOfAuthors:1,
    positions:[{position:4,authorName:'Researcher',department:'Engineering',college:'Example College'}]
  });
  assert.equal(sale.validateSync(),undefined);
  const invalid = new AuthorshipSale({saleNo:'AS-BAD',journal:id(),article:id(),vendor:id(),createdBy:id(),numberOfAuthors:1,positions:[]});
  assert.ok(invalid.validateSync()?.errors.positions);
});
