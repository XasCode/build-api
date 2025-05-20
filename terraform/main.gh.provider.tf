terraform {
  required_providers {
    github = {
      source  = "integrations/github"
    }
  }
}

provider "github" {
  token = var.gh_token
  owner = var.gh_org
}
