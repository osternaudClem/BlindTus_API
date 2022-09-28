import express from 'express';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import sendinblueTransport from 'nodemailer-sendinblue-transport';
import path from 'path';
import { config } from '../config';
const viewPath = path.resolve(__dirname, '../templates/views');
const partialsPath = path.resolve(__dirname, '../templates/partials');

export function sendMail(subject, context) {
  const sendinblue = config.sendinblue;
  const mailData = {
    from: 'contact@blindtus.com',  // sender address
    to: context.email,   // list of receivers
    subject,
    template: 'confirm',
    context,
  };

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'SendinBlue',
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'osternaud.clement@gmail.com', // generated ethereal user
      pass: 'fC7ELBP3SZUsDtzN'  // generated ethereal password
    }
  });

  transporter.use('compile', hbs({
    viewEngine: {
      //extension name
      extName: '.handlebars',
      // layout path declare
      layoutsDir: viewPath,
      defaultLayout: false,
      //partials directory path
      partialsDir: partialsPath,
      express
    },
    //View path declare
    viewPath: viewPath,
    extName: '.handlebars',
  }));

  transporter.sendMail(mailData).then(info => {
    console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
  });
}

export function sendTestEmail(subject, context) {
  const mailData = {
    from: 'youremail@gmail.com',  // sender address
    to: context.email,   // list of receivers
    subject,
    template: 'confirm',
    context,
  };

  const account = ethereal;

  nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: account.user, // generated ethereal user
        pass: account.pass  // generated ethereal password
      }
    });

    transporter.use('compile', hbs({
      viewEngine: {
        //extension name
        extName: '.handlebars',
        // layout path declare
        layoutsDir: viewPath,
        defaultLayout: false,
        //partials directory path
        partialsDir: partialsPath,
        express
      },
      //View path declare
      viewPath: viewPath,
      extName: '.handlebars',
    }));

    transporter.sendMail(mailData).then(info => {
      console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    });
  });
}