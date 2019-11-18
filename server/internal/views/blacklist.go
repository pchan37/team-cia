package views

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/PGo-Projects/webresponse"
	"github.com/go-chi/chi"
	"github.com/pchan37/team-cia/server/internal/blacklistdb"
)

var (
	ErrInternalServer = errors.New("We're sorry, but something unexpected occured!  Please try again later.")
)

func RegisterBlacklistEndPoints(mux *chi.Mux) {
	mux.Post("/add_url", addURLHandler)
	mux.Post("/delete_url", deleteURLHandler)
	mux.Get("/get_blacklist", getBlacklistHandler)
}

func addURLHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	url := r.FormValue("url")
	if err := blacklistdb.AddURL(url); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func deleteURLHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	url := r.FormValue("url")
	time := r.FormValue("time")
	if err := blacklistdb.DeleteURL(url, time); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func getBlacklistHandler(w http.ResponseWriter, r *http.Request) {
	blacklist, err := blacklistdb.GetBlacklist()
	if err != nil {
		response := webresponse.Error(ErrInternalServer)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write(response)
		return
	}

	response, err := json.Marshal(blacklist)
	if err != nil {
		response := webresponse.Error(ErrInternalServer)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write(response)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(response)
}
