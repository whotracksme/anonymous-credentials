terragrunt = {

  remote_state {

    backend = "s3"
    config {
      encrypt = false
      bucket = "cliqz-ci"

      key = "tf-state/hpnv2/prod/${path_relative_to_include()}/terraform.tfstate"
      region = "us-east-1"

      profile = "cliqz-primary"
      lock_table = "terraform-lock"
    }
  }

  terraform "retry_lock" {
    extra_arguments "retry_lock" {
      commands = [
        "init",
        "apply",
        "refresh",
        "import",
        "plan",
        "taint",
        "untaint"
      ]
      arguments = [
        "-lock-timeout=20m"
      ]
    }
  }
}
