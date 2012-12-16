echo "*** Removing old database ***"
rm inkle_db

echo
echo "*** Syncing new database ***"
echo "no" | python manage.py syncdb

echo
echo "*** Populating new database ***"
echo "import populateDatabase" | python manage.py shell

echo
echo
echo "*** Success ***"
