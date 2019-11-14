package database

import (
	"context"
	"sync"

	"github.com/PGo-Projects/output"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

func MustMongoClient(ctx context.Context, uri string) *mongo.Client {
	var once sync.Once
	once.Do(func() {
		clientOptions := options.Client().ApplyURI(uri)
		mongoClient, err := mongo.Connect(ctx, clientOptions)

		if err != nil {
			output.ErrorAndPanic(err)
		}

		if err = mongoClient.Ping(ctx, nil); err != nil {
			output.ErrorAndPanic(err)
		}

		client = mongoClient
	})

	return client
}
