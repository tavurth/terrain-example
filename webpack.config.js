const webpack = require('webpack');
const path = require('path');

const sourcePath         = path.join(__dirname, './client');
const staticsPath        = path.join(__dirname, './static');
const CopyWebpackPlugin  = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const DashboardPlugin    = require('webpack-dashboard/plugin');

module.exports = function (env) {
    const nodeEnv = env && env.prod ? 'production' : 'development';
    const isProd = nodeEnv === 'production';

    const plugins = [
        new webpack.DefinePlugin({
            'process.env': { NODE_ENV: JSON.stringify(nodeEnv) }
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'lib',
            minChunks: function (module) {
                // this assumes your vendor imports exist in the node_modules directory
                return module.context && module.context.indexOf('node_modules') !== -1;
            }
        })
    ];

    if (isProd) {
        plugins.push(
            new CleanWebpackPlugin('dist', {
                dry: false,
                verbose: true
            }),
            new CopyWebpackPlugin([
                { from: 'assets', to: 'assets' }
            ]),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                    screw_ie8: true,
                    conditionals: true,
                    unused: true,
                    comparisons: true,
                    sequences: true,
                    dead_code: true,
                    evaluate: true,
                    if_return: true,
                    join_vars: true
                },
                output: {
                    comments: false
                }
            })
        );
    } else {
        plugins.push(
            new DashboardPlugin(),
            new webpack.HotModuleReplacementPlugin()
        );
    }

    return {
        devtool: isProd ? 'source-map' : 'eval',
        context: sourcePath,
        entry: {
            app: [ 'babel-polyfill', './index.js' ]
        },
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist')
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'file-loader',
                        query: {
                            name: '[name].[ext]'
                        }
                    }
                },
                {
                    test: /\.scss$/,
                    exclude: [/node_modules/, /src\/css\/utility\.scss$/],
                    loaders: ['style-loader', 'css-loader', 'sass-loader']
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: [
                        'babel-loader'
                    ]
                },
            ]
        },
        resolve: {
            extensions: [
                '.js',
                '.jsx',
                '.sass',
                '.loader.js',
                '.web-loader.js',
                '.webpack-loader.js'
            ],
            modules: [
                path.resolve(__dirname, 'node_modules'),
                sourcePath
            ]
        },
        externals: {
        },

        plugins,

        performance: isProd && {
            maxAssetSize: 100,
            maxEntrypointSize: 300,
            hints: 'warning'
        },

        stats: {
            colors: {
                green: '\u001b[32m'
            }
        },

        devServer: {
            port: 8282,
            contentBase: './client',
            historyApiFallback: true,
            compress: isProd,
            inline: !isProd,
            hot: !isProd,
            stats: {
                assets: false,
                children: false,
                chunks: false,
                hash: false,
                modules: false,
                publicPath: false,
                timings: false,
                version: false,
                warnings: false,
                colors: {
                    green: '\u001b[32m'
                }
            }
        }
    };
};
