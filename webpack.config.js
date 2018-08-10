const {resolve} = require('path');
const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devServerPort = process.env.PORT || 6060;

const PATHS = {
    output: resolve(__dirname, 'dist/'),
    app: resolve(__dirname, './app/main.js'),
    nodeModules: resolve(__dirname, 'node_modules')
};

module.exports = {
    mode: 'production',
    entry: {
        app: PATHS.app
    },
    output: {
        filename: "[name].bundle.js",
        path: PATHS.output,
        publicPath: "./"
    },
    devServer: {
        port: devServerPort,
        publicPath: `http://localhost:${devServerPort}/`,
        watchOptions: {
            ignored: /node_modules/
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                loader: 'raw-loader'
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader: 'css-loader', options: {sourceMap: true, importLoaders: 1}},
                    {loader: 'sass-loader', options: {sourceMap: true}},
                ]
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {}
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: './index.html',
            inject: 'body'
        }),
        new MiniCssExtractPlugin({
            filename: 'css/app.css'
        })
    ]
};