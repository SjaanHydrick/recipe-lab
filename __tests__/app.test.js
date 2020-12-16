const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Recipe = require('../lib/models/recipe');

describe('recipe-lab routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  it('creates a recipe', () => {
    return request(app)
      .post('/api/v1/recipes')
      .send({
        name: 'cookies',
        directions: [
          'preheat oven to 375',
          'mix ingredients',
          'put dough on cookie sheet',
          'bake for 10 minutes'
        ]
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'cookies',
          directions: [
            'preheat oven to 375',
            'mix ingredients',
            'put dough on cookie sheet',
            'bake for 10 minutes'
          ]
        });
      });
  });

  it('creates a log', () => {
    return request(app)
      .post('/api/v1/logs')
      .send({
        recipeId: '1',
        dateOfEvent: '1/1/11',
        notes: 'Takes gewd',
        rating: '11/10'
      })
      .then(res => {
        expect(res.body).toEqual({
          recipeId: '1',
          dateOfEvent: '1/1/11',
          notes: 'Takes gewd',
          rating: '11/10'
        });
      });
  });

  it('gets all recipes', async() => {
    const recipes = await Promise.all([
      { name: 'cookies', directions: [] },
      { name: 'cake', directions: [] },
      { name: 'pie', directions: [] }
    ].map(recipe => Recipe.insert(recipe)));

    return request(app)
      .get('/api/v1/recipes')
      .then(res => {
        recipes.forEach(recipe => {
          expect(res.body).toContainEqual(recipe);
        });
      });
  });

  it('gets a recipe by id', async() => {
    const macnchs = await Recipe.insert({
      name: 'macaroni and cheese',
      directions:[
        'preheat oven to 350',
        'mix ingredients in big bowl',
        'back for 1 hour'
      ]
    });

    return request(app)
      .get(`/api/v1/recipes/${macnchs.id}`)
      .then(res => {
        expect(res.body).toEqual(macnchs);
      });
  });

  it('updates a recipe by id', async() => {
    const recipe = await Recipe.insert({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
    });

    return request(app)
      .put(`/api/v1/recipes/${recipe.id}`)
      .send({
        name: 'good cookies',
        directions: [
          'preheat oven to 375',
          'mix ingredients',
          'put dough on cookie sheet',
          'bake for 10 minutes'
        ]
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'good cookies',
          directions: [
            'preheat oven to 375',
            'mix ingredients',
            'put dough on cookie sheet',
            'bake for 10 minutes'
          ]
        });
      });
  });

  it('deletes a recipe', async() => {
    const noodles = await Recipe.insert({
      name: 'buttered noodles',
      directions: [
        'put noodles in boiling water',
        'when soft, strain and then add butter'
      ]
    });

    return request(app)
      .delete(`/api/v1/recipes/${noodles.id}`)
      .then(res => {
        expect(res.body).toEqual(noodles);
      });
  });
});

