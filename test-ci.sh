#!/bin/sh

gen_script() {
    JOBNAME="$1"
    AFTERJOB=`cat .gitlab-ci.yml | sed -n "/$JOBNAME/,"'$p'`
    AFTERSCRIPT=`echo "$AFTERJOB" | sed -n "/script/,"'$p'  | sed '1d'`
    SCRIPT=`echo "$AFTERSCRIPT" | awk '!/[[:space:]]-/ {exit} 1'`
    ONELINE=`echo "$SCRIPT" | tr '\n' ' '`
    DASHSPLIT=`echo $ONELINE | sed -E 's/-[[:space:]]/\n/g' | sed '1d'`
    echo "$DASHSPLIT"
    echo "$DASHSPLIT" | while read line; do
        echo -n "$line;"
    done
}

read_image() {
    JOBNAME="$1"
    AFTERJOB=`cat .gitlab-ci.yml | sed -n "/$JOBNAME/,"'$p'`
    IMAGELINE=`echo "$AFTERJOB" | sed -n '/image/p' | sed -n '1p'`
    echo $IMAGELINE | (read _ image; echo "$image" )
}

if test $# -eq 0
then
	echo "usage: `basename $0` <job> [SHELL]\n"
    echo 'SHELL\n\tdefault is "sh", can be overrided with eg. "ash"'
	exit 1
fi

JOBNAME="$1"
IMAGE=`read_image "$JOBNAME"`
SCRIPT=`gen_script "$JOBNAME"`
SHELL=`test -n "$2" && echo "$2" || echo "sh"`
docker run -it --rm --name test-ci -w "/app" -v "$PWD":"/app" \
    "$IMAGE" /bin/"$SHELL" -c "$SCRIPT"