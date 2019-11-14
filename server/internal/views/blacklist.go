package views

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/pchan37/team-cia/server/internal/blacklistdb"
)

func RegisterBlacklistEndPoints(mux *chi.Mux) {
	mux.Post("/add_url", addURLHandler)
	mux.Post("/delete_url", deleteURLHandler)
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
	if err := blacklistdb.DeleteURL(url); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
