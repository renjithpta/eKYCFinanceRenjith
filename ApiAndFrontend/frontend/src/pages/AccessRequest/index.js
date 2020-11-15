import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Flex, Box, Card, Heading, Text, Form, Field, Button, Loader } from 'rimble-ui';

import qs from 'qs';

import api from '../../service/api';

const AccessRequest = () => {

    const history = useHistory();

    const [validated, setValidated] = useState(false);
    const [clientData, setClientData] = useState({email:''});
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [newClientMsg, setNewClientMsg] = useState('');

    function handleName(e) {
        setClientData({ ...clientData, name: e.target.value });
    };

    function handleAddress(e) {
        setClientData({ ...clientData, address: e.target.value });
    };

    function handleDateOfBirth(e) {
        setClientData({ ...clientData, dateOfBirth: e.target.value });
    };

    function handleIdNumber(e) {
        setClientData({ ...clientData, idNumber: e.target.value });
    };

    function handleEmail(e){
        setClientData({ ...clientData, email: e.target.value });
    }

  

    const validateForm = useCallback(
        () => {
            if (
                clientData.email && clientData.email.length > 0 &&
               !isLoading

            ) {
                setValidated(true);
                setSubmitDisabled(false);
            } else {
                setValidated(false);
                setSubmitDisabled(true);
            }
        },
        [clientData,isLoading]
    );

    useEffect(() => {
        validateForm();
    }, [validateForm]);

    useEffect(() => {
        if (validated && isLoading) {
            try {
            
                api
                    .post('/fi/accessRequest', qs.stringify(clientData))
                    .then(res => {
                        console.log(res);
                        if (res.status === 200) {
                            setNewClientMsg(res.data.message);
                        } else {
                            console.log('Oopps... something wrong, status code ' + res.status);
                            return function cleanup() { }
                        }
                    })
                    .catch((err) => {
                        console.log('Oopps... something wrong',err);
                        console.log(err);
                        return function cleanup() { }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            } catch (error) {
                console.log('mai errorOopps... something wrong',error);
                console.log(error);
                setIsLoading(false);
                return function cleanup() { }
            }
        }
    }, [clientData, validated, isLoading, history]);

    const handleSubmit = e => {
        e.preventDefault();
        setIsLoading(true);
        setNewClientMsg('');
    };

    const handleClickOnBack = e => {
        e.preventDefault();
        history.push('/fi');
    }

    return (
        <Flex height={'50vh'}>
            <Box mx={'auto'} my={'auto'} width={[1, 9 / 12, 7 / 12]}>
                <Flex px={2} mx={'auto'} justifyContent='space-between'>
                    <Box my={'auto'}>
                        <Heading as={'h2'} color={'primary'}>Client Access Request</Heading>
                    </Box>
                    <Box my={'auto'}>
                        <Button onClick={handleClickOnBack}>Back</Button>
                    </Box>
                </Flex>
                <Form onSubmit={handleSubmit}>
                    <Card mb={20}>
                        <Flex mx={-3} flexWrap={"wrap"}>
                            <Box width={1} px={3}>
                                <Field label="Email" width={1}>
                                    <Form.Input
                                        type="text"
                                        required
                                        onChange={handleEmail}
                                        value={clientData.email}
                                        width={1}
                                    />
                                </Field>
                            </Box>
                            
                        </Flex>
                    </Card>
                    <Card>
                        <Flex mx={-3} alignItems={'center'}>
                            <Box px={3}>
                                <Button type="submit" mt={2} disabled={submitDisabled}>
                                    {isLoading ? <Loader color="white" /> : <p>Request Access</p>}
                                </Button>
                            </Box>
                            {newClientMsg &&
                                <Box px={3}>
                                    <Text>{newClientMsg}</Text>
                                </Box>
                            }
                        </Flex>
                    </Card>
                </Form>
            </Box>
        </Flex>
    );
}

export default AccessRequest;