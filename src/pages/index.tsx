import Router from "next/router";
import React, {  FormEvent } from "react";
import tw from "twin.macro";
import { v4 as uuidv4 } from 'uuid';

const Index: React.FC<{ playerId: string }> = (props) => {

  const onSubmitForm = async (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    await fetch("/api/wordle/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formProps),
    });

    Router.push('/wordle');
  };

  return (
    <div tw="w-full h-full grid place-items-center h-screen">
      <form onSubmit={onSubmitForm} tw="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div tw="mb-4">
          <label tw="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Tell me your name
          </label>
          <input hidden defaultValue={uuidv4()} name="playerId"/>
          <input tw="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none" name="name" type="text" placeholder="your name" />
        </div>
        <div tw="flex items-center justify-center content-center">
          <input tw="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none" type="submit" value="Lets play" />
        </div>
      </form>
    </div>
  )
};

export default Index;
