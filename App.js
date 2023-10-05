import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, FlatList, Keyboard } from 'react-native';
import * as SQLite from 'expo-sqlite';


export default function App() {
  // product input
  const [product, setProduct] = useState('');
  // amount input 
  const [amount, setAmount] = useState('');
  // data is saved here
  const [data, setData] = useState([]);

  // creating a database
  const db = SQLite.openDatabase('shoppinglist.db');

  // creating a table
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists data (id integer primary key not null, product text, amount text);'); 
    }, 
    () => console.error("Error when creating DB"), updateList);
  }, []);

  // adding things to shopping list and clearing inputs
  const saveItem = () => {
      db.transaction(tx => {
        tx.executeSql('insert into data (product, amount) values (?, ?);',
          [product, amount]);
      }, null, updateList)
      setProduct('');
      setAmount('');
      Keyboard.dismiss();
  }

  // updating shopping list everytime changes are made to the shopping list
  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from data;', [], (_, { rows }) =>
        setData(rows._array)
      );
      
    }, null, null);
  }

  // deleting an item from the shopping list
  const deleteItem = (id) => {
    db.transaction(
    tx => { 
      tx.executeSql('delete from data where id = ?;', [id]);
    }, 
    null, 
    updateList)
  }

  return (
    <View style={styles.container}>
      <TextInput 
          placeholder='Product'
          style={styles.input} 
          onChangeText={product => setProduct(product)} 
          value={product} />
          <TextInput 
          placeholder='Amount'
          style={styles.input} 
          onChangeText={amount => setAmount(amount)} 
          value={amount} />
      <View style={styles.button}>
            <Button onPress={saveItem} title="SAVE" />
      </View>
      <Text style={styles.title}>Shopping List</Text>
      <FlatList style={styles.list}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => 
          <View style={styles.list}>
            <Text>{item.product}, {item.amount}</Text>
            <Text style={styles.delete} onPress={() => deleteItem(item.id)}>  done</Text>
          </View>}
        data={data}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  input: {
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1
  },
  title: {
    marginTop: 10,
    fontSize: 20,
    marginBottom: 10,
  },
  list: {
    flexDirection: 'row',
  },
  delete: {
    color: "green",
  },
  // iPhone button does not have bacground color
  button: {
    backgroundColor: "#AED6F1",
    marginTop: 10,
    marginBottom: 10,
  },
});