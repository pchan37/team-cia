package securitydb

import (
	"context"
	"sync"

	"github.com/pchan37/team-cia/server/internal/config"
	"github.com/pchan37/team-cia/server/internal/database"
	"github.com/PGo-Projects/webauth"
	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type mongoClientWrapper struct {
	client *mongo.Client
	ctx    context.Context
}

var client *mongoClientWrapper

func MustMongoClient(ctx context.Context, uri string) webauth.Database {
	var once sync.Once
	once.Do(func() {
		mongoClient := database.MustMongoClient(ctx, uri)

		client = &mongoClientWrapper{
			client: mongoClient,
			ctx:    ctx,
		}
	})
	return client
}

func (w *mongoClientWrapper) FindOne(filter interface{}) (interface{}, error) {
	credentials := filter.(webauth.Credentials)
	f := bson.D{
		{Key: "username", Value: credentials.Username},
	}

	dbName := viper.GetString(config.DBName)
	auth := w.client.Database(dbName).Collection("authentication")
	err := auth.FindOne(w.ctx, f).Decode(&credentials)
	return credentials, err
}

func (w *mongoClientWrapper) InsertOne(entry interface{}) error {
	credentials := entry.(webauth.Credentials)

	dbName := viper.GetString(config.DBName)
	auth := w.client.Database(dbName).Collection("authentication")
	_, err := auth.InsertOne(w.ctx, credentials)
	return err
}
