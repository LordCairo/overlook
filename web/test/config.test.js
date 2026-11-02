// The files the setup page hands back: overlook.yaml, each key in it a
// ${VAR}, and the .env that holds them.

import assert from "node:assert/strict";
import { test } from "node:test";
import { anchor, dotenv, readme, scalar, yaml } from "../js/config.js";
import { setWords } from "../js/text.js";

const adapters = [
  { key: "gatus", asks: [{ field: "name", optional: true }, { field: "url" }, { field: "password", key: true }] },
  {
    key: "github",
    asks: [
      { field: "repos", list: true },
      { field: "token", key: true, optional: true },
    ],
  },
  {
    key: "proxmox",
    asks: [{ field: "url" }, { field: "token" }, { field: "secret", key: true }, { field: "ca", optional: true }],
  },
];
const sources = [
  {
    adapter: "proxmox",
    fields: { url: "https://pve.example.com:8006", token: "overlook@pve!overlook", secret: "s#1" },
  },
  { adapter: "gatus", fields: { url: "http://gatus.example.com:8080" } },
  {
    adapter: "proxmox",
    fields: { url: "https://lab.example.com:8006", token: "overlook@pve!lab", secret: 'q"2=', ca: "pve root.pem" },
  },
  { adapter: "github", fields: { repos: ["example/homelab", "example/dotfiles"] } },
];

test("overlook.yaml names each key, as its adapter's and field's, numbered from the second source", () => {
  setWords({
    "setup.yaml.head": "Head",
    "setup.yaml.links": "# apps:",
    "setup.adapter.gatus": "Gatus",
    "setup.adapter.github": "GitHub",
    "setup.adapter.proxmox": "Proxmox VE",
  });
  assert.equal(
    yaml(adapters, sources, readme("0.5.0")),
    `# Head

sources:
  gatus:
    # Gatus: https://github.com/bnlqn/overlook/blob/v0.5.0/README.md#gatus
    - url: http://gatus.example.com:8080
  github:
    # GitHub: https://github.com/bnlqn/overlook/blob/v0.5.0/README.md#github
    - repos:
        - example/homelab
        - example/dotfiles
  proxmox:
    # Proxmox VE: https://github.com/bnlqn/overlook/blob/v0.5.0/README.md#proxmox-ve
    - url: https://pve.example.com:8006
      token: overlook@pve!overlook
      secret: \${PROXMOX_SECRET}
    - url: https://lab.example.com:8006
      token: overlook@pve!lab
      secret: \${PROXMOX_2_SECRET}
      ca: "pve root.pem"

# apps:
`,
  );
});

test(".env holds each key as typed", () => {
  setWords({ "setup.env.head": "Keys" });
  assert.equal(dotenv(adapters, sources), `# Keys\nPROXMOX_SECRET=s#1\nPROXMOX_2_SECRET=q"2=\n`);
});

test("a value YAML would read as something else is quoted", () => {
  for (const v of ["https://pve.example.com:8006/x?y=1", "overlook@pve!overlook", `\${KEY}`, "ups"]) {
    assert.equal(scalar(v), v);
  }
  for (const v of ["8080", "yes", "a: b", "a #b", "@home", "ends:", "- x", ""]) {
    assert.equal(scalar(v), JSON.stringify(v));
  }
});

test("the README is the release's, or the repository's for any other build", () => {
  assert.equal(readme("0.5.0-rc.1"), "https://github.com/bnlqn/overlook/blob/v0.5.0-rc.1/README.md");
  for (const v of ["", undefined, "0.4.1-0.20261102084042-92252c90ba14+dirty"]) {
    assert.equal(readme(v), "https://github.com/bnlqn/overlook");
  }
});

test("a README heading's anchor is GitHub's", () => {
  assert.equal(anchor("Plex, through Tautulli"), "plex-through-tautulli");
  assert.equal(anchor("Pi-hole"), "pi-hole");
  assert.equal(anchor("iCalendar to-do list"), "icalendar-to-do-list");
});
