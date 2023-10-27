import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Keyboard } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Header, Input, Button, ListItem, Icon } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';


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
    <SafeAreaProvider>
    <View>
      <Header
        centerComponent={{ text: 'SHOPPING LIST', style: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10} }}
      />
      <View style={styles.space}></View>
      <Input
        label='Product'
        placeholder='Write product here'
        style={styles.input}
        onChangeText={product => setProduct(product)}
        value={product} />
      <Input
        label='Amount'
        placeholder='Write amount here'
        onChangeText={amount => setAmount(amount)}
        value={amount} />
        <Button raised icon={{name: 'save', color: "white"}} onPress={saveItem} title="SAVE" />
      <FlatList 
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) =>
        <ListItem bottomDivider>
          <ListItem.Content>
          <View style={styles.flex}>
            <ListItem.Title>{item.product}</ListItem.Title>
            </View>
            <ListItem.Subtitle>{item.amount}</ListItem.Subtitle>
          </ListItem.Content>
          <Icon style={styles.icon} name="trash-can-outline" type="material-community" color="red" onPress={() => deleteItem(item.id)}/>
          </ListItem>}
      />
      <StatusBar style="auto" />
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  icon: {
    justifyContent: "flex-end",
  },
  flex:{
    flexDirection: 'row',
    alignItem: "right",
  },
  space: {
    marginTop: 20
  }
});