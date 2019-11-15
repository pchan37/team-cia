package blacklist

type Entry struct {
	URL  string `bson:"url,omitempty" json:"url"`
	Time string `bson:"time,omitempty" json:"time"`
}
