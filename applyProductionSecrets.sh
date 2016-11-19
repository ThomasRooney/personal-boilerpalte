#!/usr/bin/env bash

applyProductionConfigVariables() {

  declare ROOT_DIR=$(git rev-parse --show-toplevel)
  declare CONFIG_FILE=$ROOT_DIR/backend/config.json
  declare VALUE
  declare PROD_VARIABLE

  declare -a PROD_VARIABLES

  PROD_VARIABLES=(
    'IDENTITY_POOL_ID'
    'IDENTITY_POOL_NAME'
    'AWS_ACCOUNT_ID'
    'REGION'
  )

  if [ ! -f $CONFIG_FILE ]
  then
    echo "We expect a config file to exist at $CONFIG_FILE.. No such file found"
    return
  fi

  echo "Loading Prod Configuration in $CONFIG_FILE (non-secret)..."



  for PROD_VARIABLE in ${PROD_VARIABLES[@]}; do
      VALUE=$(jq -r ".$PROD_VARIABLE" $CONFIG_FILE)
      if [ -z $VALUE ]; then
        echo "Couldn't find $VALUE in $CONFIG_FILE"
      fi
      echo -n "    Setting ${PROD_VARIABLE}=${VALUE}.. "
      export ${PROD_VARIABLE}=${VALUE}
      echo 'Done!'

      echo -n "    Setting TF_VAR_${PROD_VARIABLE}=${VALUE}.. "
      export TF_VAR_${PROD_VARIABLE}=${VALUE}
      echo 'Done!'

  done


  echo "Remember that when this file is changed (e.g. by running init-dev) you'll need to re-run this script"
}

applyProductionSecretsToEnv() {
    echo "Loading Secrets.."
    declare ROOT_DIR=$(git rev-parse --show-toplevel)
    declare -r SECRETS_DIR=$ROOT_DIR/.secrets
    declare SECRET_PASSWORD
    declare -a UNENCRYPTED_FILES
    declare -a ENCRYPTED_FILES
    declare ENCRYPTED_FILE
    declare UNENCRYPTED_FILE
    declare FILENAME
    declare ENV_VARIABLE
    declare SECRET
    declare PREFIX

    # echo -n "Prefix (e.g. TF_): "
    # read PREFIX
    # echo

    echo -n "Using OpenSSL at: "
    if ! which openssl
    then
      echo "Please install openssl"
      return
    fi

    if [ ! -d $SECRETS_DIR ]
    then
      echo "We expect our secrets to be in $SECRETS_DIR.. No such directory found"
      return
    fi

    __ensure_secret_password() {
      if [ -z ${SECRET_PASSWORD} ]
      then
        echo -n "Password: "
        read -s SECRET_PASSWORD
        echo
      fi
    }

    __secret_enc() {
      openssl enc -aes-256-cbc -a -salt -in "$1" -out "$2" -k $SECRET_PASSWORD
    }

    __secret_dec() {
      openssl enc -d -aes-256-cbc -a -salt -in "$1" -k $SECRET_PASSWORD
    }
    UNENCRYPTED_FILES=($(find -E $SECRETS_DIR -type f -maxdepth 1 | grep -v \.enc | grep secret ))
    if [ "${#UNENCRYPTED_FILES[@]}" -gt 0 ]
    then
      echo "You have unencrypted Key files in your directory. We will now encrypt them and delete the unencrypted originals."
      echo "Every time you run subsequently run this script you will be prompted to enter this password."
      if [ "${#ENCRYPTED_FILES[@]}" -gt 0 ]
      then
        echo "Remember to enter the same password as you use for your other encrypted files ($ENCRYPTED_FILES)"
      fi
      __ensure_secret_password
      # Run Command
      for UNENCRYPTED_FILE in ${UNENCRYPTED_FILES[*]}
      do
        printf "    Encrypting: %s\n" $UNENCRYPTED_FILE
        $(__secret_enc $UNENCRYPTED_FILE $UNENCRYPTED_FILE.enc)
        printf "    ... Done. Result at $UNENCRYPTED_FILE.enc\n"
        rm $UNENCRYPTED_FILE
        printf "    ... Deleted $UNENCRYPTED_FILE\n"
      done
    fi

    ENCRYPTED_FILES=($(find -E $SECRETS_DIR -type f -maxdepth 1 | grep \.enc | grep secret))

    for ENCRYPTED_FILE in ${ENCRYPTED_FILES[*]}
    do
      __ensure_secret_password
      FILENAME=$(basename $ENCRYPTED_FILE)
      ENV_VARIABLE=$(echo $FILENAME | perl -pe 's|(.*?)\.secret.*|\1|' | xargs -I {} echo $PREFIX{} )
      SECRET=$(__secret_dec $ENCRYPTED_FILE)
      if [ -z ${ENV_VARIABLE+x} ]
      then
        echo "Environment variable \$$ENV_VARIABLE already set.. resetting"
        unset $ENV_VARIABLE
      fi
      printf "    Decrypting: %s\n" $ENCRYPTED_FILE
      export ${ENV_VARIABLE}=${SECRET}
      printf "    ... Done. \$$ENV_VARIABLE configured\n"
    done
    unset -f __secret_enc
    unset -f __secret_dec
    unset -f __ensure_secret_password
}

if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
  applyProductionConfigVariables
  applyProductionSecretsToEnv
else
  echo "This script needs to be sourced for environment variables to be set"
  exit 1;
fi
