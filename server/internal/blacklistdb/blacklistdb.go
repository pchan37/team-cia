package blacklistdb

import (
	"context"
	"time"

	"github.com/pchan37/team-cia/server/internal/blacklistdb/blacklist"
	"github.com/pchan37/team-cia/server/internal/config"
	"github.com/pchan37/team-cia/server/internal/database"
	"github.com/spf13/viper"
)

var (
	dbClient = database.MustMongoClient(context.TODO(), "mongodb://localhost:27017")
)

func GetBlacklist() ([]blacklist.Entry, error) {
	dbName := viper.GetString(config.DBName)
	masterBlacklist := dbClient.Database(dbName).Collection("blacklist")

	cursor, err := masterBlacklist.Find(context.TODO(), blacklist.Entry{})
	if err != nil {
		return nil, err
	}

	var urls []blacklist.Entry
	for cursor.Next(context.TODO()) {
		var u blacklist.Entry
		if err := cursor.Decode(&u); err != nil {
			return nil, err
		}

		urls = append(urls, u)
	}
	return urls, nil
}

func AddURL(url string) error {
	dbName := viper.GetString(config.DBName)
	masterBlacklist := dbClient.Database(dbName).Collection("blacklist")

	now := time.Now()
	entry := &blacklist.Entry{
		URL:  url,
		Time: now.Format("01-02-2006 15:04:05"),
	}
	_, err := masterBlacklist.InsertOne(context.TODO(), entry)
	return err
}

func DeleteURL(url, time string) error {
	dbName := viper.GetString(config.DBName)
	masterBlacklist := dbClient.Database(dbName).Collection("blacklist")

	entry := &blacklist.Entry{
		URL:  url,
		Time: time,
	}
	_, err := masterBlacklist.DeleteOne(context.TODO(), entry)
	return err
}
