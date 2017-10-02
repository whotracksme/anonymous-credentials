terragrunt = {

  include = {
    path = "${find_in_parent_folders()}"
  }

  dependencies {
    paths = ["../../data/groupsign-redis"]
  }
}
