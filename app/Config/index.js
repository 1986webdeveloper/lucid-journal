import {openDatabase} from 'react-native-sqlite-storage';

let config = openDatabase ({name: 'lucidDatabase.db', location: 'default'});

export const db = config;
