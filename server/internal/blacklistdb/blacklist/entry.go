package blacklist

type Entry struct {
	URL  string
	Time string `bson:"time,omitempty"`
}
