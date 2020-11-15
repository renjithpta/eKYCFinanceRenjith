/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';
import { Object as Obj , Property } from 'fabric-contract-api';


/**
 * State class. States have a type, unique key, and a lifecycle current state
 * the current state is determined by the specific subclass
 */
@Obj()
export default class State {

    
    private type:string;


    /**
     * @param {String|Object} type  An indentifiable type of the instance
     * @param {keyParts[]} elements to pull together to make a key for the objects
     */
    public constructor(type: string, obj:any) {
        this.type = type;
        Object.assign(this, obj);
    }

    
    /**
     * Create Client state key
     *
     * @return string: Uniquekey for the client state 
     */
    public static makeClientKey(id?:string) :string{
     
        return 'CLIENT' +id;
       
    }

    public static makeFlKey(id?:string) :string{
      
        return 'FI' +id;
     
    }

    public static makeCompositeKeyClientFL():string {
        return 'clientId~fiId';
    }

    public static makeCompositeKeyFlClient():string {
        return 'fiId~clientId';
    }

    public setType(type:string){
        this.type = type;
    }

    public getType():string{
        return this.type;
    }

   
  
}