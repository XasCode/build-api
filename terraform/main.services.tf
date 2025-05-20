resource "google_project_service" "cloud_functions" {
  project = local.project.id
  service = "cloudfunctions.googleapis.com"
  timeouts {
    create = "3m"
    update = "6m"
  }
  disable_dependent_services = true
}

resource "google_project_service" "cloud_build" {
  project = local.project.id
  service = "cloudbuild.googleapis.com"
  timeouts {
    create = "3m"
    update = "6m"
  }
  disable_dependent_services = true
}

resource "google_project_service" "secretmanager" {
  project = local.project.id
  service = "secretmanager.googleapis.com"
  timeouts {
    create = "3m"
    update = "6m"
  }
  disable_dependent_services = true
}

resource "google_project_service" "sourcerepo" {
  project = local.project.id
  service = "sourcerepo.googleapis.com"
  timeouts {
    create = "3m"
    update = "6m"
  }
  disable_dependent_services = true
}
