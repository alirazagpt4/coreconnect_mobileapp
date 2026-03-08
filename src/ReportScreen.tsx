import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, List, Card } from 'react-native-paper';

const ReportScreen = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
                <Appbar.Content title="Reports" titleStyle={{ color: 'white' }} />
            </Appbar.Header>

            <View style={styles.content}>
                <Card style={styles.menuCard} onPress={() => navigation.navigate('Attendance Report')}>
                    <List.Item
                        title="Attendance Report"

                        left={props => <List.Icon {...props} icon="account-check" color="#3498db" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                    />
                </Card>

                <Card style={styles.menuCard} onPress={() => navigation.navigate('Sales Report')}>
                    <List.Item
                        title="Sales Report"

                        left={props => <List.Icon {...props} icon="cart" color="#27ae60" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                    />
                </Card>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { backgroundColor: '#1b2142' },
    content: { padding: 15 },
    menuCard: { marginBottom: 15, borderRadius: 10, elevation: 2 }
});

export default ReportScreen;