import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Flex, Box, Card, Heading, Text, Form, Field, Button,  Loader,Modal} from 'rimble-ui';
import { Select } from 'rimble-ui';
import qs from 'qs';

import api from '../../service/api';



const ClientRating = () => {

    const history = useHistory();

    const [validated, setValidated] = useState(false);
    const [clientData, setClientData] = useState([]);
    const [customerRate, setCustomerRate] = useState({"rate":''});
    const [shared, setShared] = useState(false);
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [submitRateDisabled, setSubmitRateDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isApprovedLoading, setIsApprovedLoading] = useState(false);
    const [newClientMsg, setNewClientMsg] = useState('');
    const [orgMSP, setOrgMSP] = useState('');
    
    const [approvedClientList, setApprovedClientList] = useState([]); const [confirmPassword, setConfirmPassword] = useState('');
    const [isOpen, setIsOpen] = useState(false);  
    const closeModal = e => {
        e.preventDefault();
        setIsOpen(false);
      };

      const shareRatingClick = e => {
        e.preventDefault();
 
        try {
            
            api
                .post('/fi/shareCustomerRate', qs.stringify({customerId:customerRate.customerId,reqfiMSPID:orgMSP}))
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
      };
    
      const openModal = e => {
        e.preventDefault();
        setNewClientMsg('')
        setIsOpen(true);
      };

    function handleRate(e) {
        
        setCustomerRate({ customerId:customerRate.customerId,oldRate:customerRate.oldRate, rate: e.target.value });
        if(!shared){
        setSubmitDisabled(false)
        }else{
            setSubmitDisabled(true);
        }
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
    function handleOrgMsp(e) {
        setOrgMSP(e.target.value)
    }
   function handleCustomerSlecet(e) {
    e.preventDefault();
   let customerId= e.target.value;
   setNewClientMsg('');
  
  try{
   
    setShared(false);
    setIsLoading(true);
    api
    .post('/fi/getCustomerRate', qs.stringify({"customerId":e.target.value}))
    .then(res => {
    
        if (res.status === 200) {
            console.log("rate",res.data.rate);
            
            setIsLoading(true);
            let rate ="";
            if(res.data.rate) rate = res.data.rate;
            setCustomerRate({customerId: customerId,oldRate:rate + '',rate:rate});
            setIsLoading(false);
           
            if(res.data.shared){
            setSubmitDisabled(true)
            setShared(true);
            setSubmitRateDisabled(true);
            }else{
            setSubmitRateDisabled(false);
            }

        } else {
            console.log('Oopps... something wrong, status code ' + res.status);
            return function cleanup() { }
        }
    })
    .catch((err) => {
        console.log('Oopps... something wrong',err);
        console.log(err);
        setCustomerRate({"customerId":customerId,rate:"",oldRate:""});
        return function cleanup() { }
    })
    .finally(() => {
        setIsLoading(false);
    });
}catch(e){
    setCustomerRate({"customerId":customerId,rate:"",oldRate:""}); 
}
   }

    const validateForm = useCallback(
        () => {
           
            if (
                customerRate.rate && customerRate.rate.length > 0 && !shared &
               !isLoading

            ) {
                setValidated(true);
                setSubmitDisabled(false);
            } else {
                setValidated(false);
                setSubmitDisabled(true);
            }
        },
        [customerRate,isLoading]
    );

   

    useEffect(() => {
        validateForm();
    }, [validateForm]);

    useEffect(() => {
if(!isApprovedLoading) {
    setApprovedClientList([{"value":"12" , "label" : "123"}]);
        api.get('/fi/getApprovedClients').then( res => {

            let approvedClients = res.data.approvedClients ;
            let listData  = [] ;
            listData.push({"value" :  '', "label" :'       --------------Select the Customer ID----------     ' })
            approvedClients.forEach( (item) => {
                listData.push({"value" :  item, "label" :item })

            });
            setClientData(listData)
            console.log("APproved clients ",approvedClients)
            setIsApprovedLoading(true);
            setApprovedClientList(approvedClients);
            console.log("APproved clients ",approvedClientList)
        });
    }

        if (validated && isLoading && customerRate.oldRate != customerRate.rate && !submitDisabled) {
            try {
           
                api
                    .post('/fi/updateCustomerRate', qs.stringify(customerRate))
                    .then(res => {
                        console.log(res);
                        if (res.status === 200) {
                            setNewClientMsg(res.data.message);
                            setIsLoading(false);
                            setValidated(false);
                            setSubmitDisabled(true);
                            customerRate.oldRate = customerRate.rate ;

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
    }, [customerRate, validated, isLoading, history]);

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
                        <Heading as={'h2'} color={'primary'}>Client Rating</Heading>
                    </Box>
                    <Box my={'auto'}>
                        <Button onClick={handleClickOnBack}>Back</Button>
                    </Box>
                </Flex>
                <Form onSubmit={handleSubmit}>
                    <Card mb={20}>
                   
                        <Flex mx={-3} flexWrap={"wrap"}>
                            <Box width={1} px={3}>
                            <Field label={"Select  your client"} required={true}>
                            <div class="sc-bwzfXH gPsUDh sc-iXhVw ejIWde" required={true}>
                            {isLoading ? <Loader color="orange" width={3} />  : <p></p>}
                            <select required={true} class='bOUUye' onChange={handleCustomerSlecet}>
      {clientData.map((item, key) => {
        return <option key={item.value} value={item.value}>{item.label}</option>;
    })}
</select></div>
                            </Field>
                          
                                  
                            </Box>
                            <Box width={1} px={3}>
                                <Field label="Rating" width={1}>
                                    <Form.Input
                                        type="text"
                                        required
                                        onChange={handleRate}
                                        value={customerRate.rate}
                                        width={1}
                                    />
                                </Field>
                            </Box>
                            
                        </Flex>
                    </Card>

                    
        <Modal isOpen={isOpen}>
          <Card width={"420px"} p={0}>
            <Button.Text
              icononly
              icon={"Close"}
              color={"moon-gray"}
              position={"absolute"}
              top={0}
              right={0}
              mt={3}
              mr={3}
              onClick={closeModal}
            />

            <Box p={4} mb={3}>
              <Heading.h3>Share Rating</Heading.h3>
             <Field label="Eneter Org  MSP">
             <Form.Input
                                        type="text"
                                        required
                                        onChange={handleOrgMsp}
                                        value={orgMSP}
                                        width={1}
                                    />
            </Field>
            </Box>

            <Flex
              px={4}
              py={3}
              borderTop={1}
              borderColor={"#E8E8E8"}
              justifyContent={"flex-end"}
            >
              <Button.Outline onClick={closeModal}>Cancel</Button.Outline>
              <Button ml={3} onClick={shareRatingClick}>  {isLoading ? <Loader color="white" /> : <p>Confirm</p>}</Button> <Text>{newClientMsg}</Text>
            </Flex>
          </Card>
        </Modal>
                    <Card>
                        <Flex mx={-3} alignItems={'center'}>
                            <Box px={3}>
                                <Button type="submit" mt={2} disabled={submitDisabled || shared}>
                                    {isLoading ? <Loader color="white" /> : <p>Update</p>}
                                </Button>
                            </Box>
                            <Box px={3}>
                                <Button type="button" mt={2} disabled={submitRateDisabled}  onClick={openModal}>
                                   <p>Share</p>
                                </Button>
                            </Box>
                            {newClientMsg &&
                            <div>
                                <Box px={3}>
                                    <Text>{newClientMsg}</Text>
                                </Box>
                                </div>
                            }
                        </Flex>
                    </Card>
                </Form>
            </Box>
        </Flex>
    );
}

export default ClientRating;