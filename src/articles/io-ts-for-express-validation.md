---
title: How to validate Express requests using io-ts
subtitle: Combine io-ts runtime type system within an Express middleware to handle request validation
date: 2020-04-26
layout: article.html
cover: /images/io-ts-for-express-validation/cover.jpg
coverColor: \#EAADAC
---

[Io-ts](https://github.com/gcanti/io-ts) is runtime type system which provides safe encoding and decoding, but if you landed on this page you probably already have a slight idea of what it is. As a matter of fact, I wrote this article to remind a future version of myself about how to use the library to validate the requests coming from a REST API endpoint in a [Express.js](https://expressjs.com/) middleware. Let's go straight to it then.

## Decoder

The first code we need to write is the [Decoder](https://github.com/gcanti/io-ts/blob/master/Decoder.md), which will take unknown input we need to check. A `Decoder` is a runtime representation of a static type and, indeed, one of the benefits of using `io-ts` compared to popular alternatives like [express-validator](https://express-validator.github.io/docs/) is the strong TypeScript typing we have for free.

Suppose we have an Express application having API endpoints for [Animal Crossing](https://animal-crossing.com/), just as an example since it's my current obsession. Let's start with the `Decoder` of an island:

```typescript
import * as D from 'io-ts/lib/Decoder';

export const IslandDec = D.type({
  fruit: D.literal('apple', 'cherry', 'orange', 'peach', 'pear'),
  hemisphere: D.literal('north', 'south'),
  villager: D.literal('daisy', 'celeste', 'neither'),
});

/*
type Island = {
    fruit: "apple" | "cherry" | "orange" | "peach" | "pear";
    hemisphere: "north" | "south";
    villager: "daisy" | "celeste" | "neither";
}
*/
export type Island = D.TypeOf<typeof IslandDec>;
```

As you can see, by using `io-ts` we have been able to both define the `Decoder` and extract the static type using the `TypeOf` operator, without declaring the type ourselves. `io-ts` comes with built-in decoders for primitive types, whereas `D.type` allows to define an object with required fields.

By using the method `.decode` we can check the validity of an object.

```typescript
IslandDec.decode({
  fruit: 'apples',
  hemisphere: 'north',
  villager: 'neither'
})
```

Did you even notice where is the error? Surely, the `Decoder` was able to strictly check the input.

```typescript
{
  value: 'required property "fruit"',
  forest: [
    {
      value:
        'cannot decode "apples", should be "apple" | "cherry" | "orange" | "peach" | "pear"',
      forest: []
    }
  ]
}
```

## Express validator

We can now leverage our `Decoder` to use it as a [Express middleware](https://expressjs.com/en/guide/using-middleware.html) to validate the request body of an API endpoint. We can write an utility to easily use `Decoders` as request validators.

```typescript
import { RequestHandler } from 'express';
import { Decoder } from 'io-ts/lib/Decoder';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Either';

export const validator: <T>(decoder: Decoder<T>) => RequestHandler<ParamsDictionary, any, T> = decoder => (
  req,
  res,
  next,
) => {
  return pipe(
    decoder.decode(req.body),
    fold(
      errors => res.status(400).send({ status: 'error', error: errors }),
      () => next(),
    ),
  );
};
```

Then finally we have all the elements to setup the validation in place. As mentioned, a nice benefit of using `io-ts` is having better types. In this case, `validator` returns a `RequestHandler<ParamsDictionary, any, T>` which is able to type `req.body` in the route handler, instead of being `any`.

```typescript
app.post('/islands', validator(IslandDec), (req, res, next) => {
  return addIsland(req.body) // req.body is strictly typed
    .then(island => res.status(301).send({ status: 'success', data: island }))
    .catch(next);
});
```

## Decoder composition

As a final note, I also want to show how flexible the `io-ts` `Decoder` is. We can for instance define a more complex `Decoder` by composing together simpler ones.

```typescript
import * as D from 'io-ts/lib/Decoder';

export const BulletinBodyDec = D.type({
  dodo: D.string,
  island: IslandDec,
  time: D.string,
  turnipPrice: D.number,
  description: D.string,
  preferences: D.type({
    concurrent: D.number,
    queue: D.number,
    hasFee: D.boolean,
    isPrivate: D.boolean,
  }),
});

export const BulletinDec = D.intersection(
  D.type({
    id: D.string,
    meta: D.type({
      creationDate: D.string,
    }),
  }),
  BulletinBodyDec,
);

export type BulletinBody = D.TypeOf<typeof BulletinBodyDec>;
export type Bulletin = D.TypeOf<typeof BulletinDec>;
```

We have defined a more complex `Bulletin` as an intersection of `Decoders` and `BulletinBodyDec` is able to reuse the previously defined `IslandDec`.

## Transform io-ts error towards a more standard error response

By default, `io-ts` returns a `NonEmptyArray<Tree<string>>` type as errors, which is an array of error trees with at least one error. The `Tree` structure is convenient to understand the hierarchy of the invalid properties, but you may wish to return a more standard error response to the client. Suppose you would like to have the following REST error response instead:

```typescript
/**
 * https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md#errorresponse--object
 */
export interface RestError {
  code: 'BadArgument';
  message: string;
  details: Array<RestError>;
}
```

The following code shows an example of how to transform the array of error `Tree`s (the type is `Array<Tree<string>>` aka `Forest<string>`) into a flatten array of `RestError`, by using a recursive function which is able to extract all the error messages from the forest.

```typescript
function getErrorValues(forest: Array<Tree<string>>): Array<string> {
  return forest.flatMap(x => {
    return x.forest.length ? [x.value, ...getErrorValues(x.forest)] : [x.value];
  });
}

export const validator: <T>(decoder: Decoder<T>) => RequestHandler<ParamsDictionary, any, T> = decoder => (
  req,
  res,
  next,
) => {
  return pipe(
    decoder.decode(req.body),
    fold(
      errorForest => {
        const details: Array<RestError> = getErrorValues(errorForest).map(message => {
          return {
            code: 'BadArgument',
            message,
          };
        });
        const error: RestError = {
          code: 'BadArgument',
          message: 'Invalid request body',
          details,
        };
        
        return res.status(400).send({ status: 'error', error });
      },
      () => next(),
    ),
  );
};
```
