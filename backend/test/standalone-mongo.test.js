import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const controller = (name) => readFile(new URL(`../src/controllers/${name}`, import.meta.url),'utf8');

test('sales workflow supports standalone MongoDB without replica-set transactions', async () => {
  const source=await controller('salesController.js');
  assert.doesNotMatch(source,/startSession|withTransaction/);
  assert.match(source,/Article\.findOneAndUpdate/);
  assert.match(source,/\$pull:\{positionBookings/);
});

test('payment verification supports standalone MongoDB', async () => {
  const source=await controller('paymentController.js');
  assert.doesNotMatch(source,/startSession|withTransaction/);
  assert.match(source,/Payment\.findOneAndUpdate/);
});
