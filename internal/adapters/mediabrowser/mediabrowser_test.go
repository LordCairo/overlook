package mediabrowser

import (
	"strings"
	"testing"
)

func TestConfigCheck(t *testing.T) {
	t.Parallel()
	c := Config{URL: "http://jellyfin:8096", Key: "0123abcd"}
	if err := c.Check("Jellyfin", nil); err != nil || c.Name != "Jellyfin" {
		t.Errorf("defaults: %+v, %v", c, err)
	}
	for _, bad := range []struct {
		c    Config
		want string
	}{
		{Config{Key: "0123abcd"}, "url is missing"},
		{Config{URL: "jellyfin:8096", Key: "0123abcd"}, "url needs"},
		{Config{URL: "http://jellyfin:8096"}, "key is missing"},
	} {
		if err := bad.c.Check("Jellyfin", nil); err == nil || !strings.Contains(err.Error(), bad.want) {
			t.Errorf("%+v: want an error with %q, got %v", bad.c, bad.want, err)
		}
	}
}
