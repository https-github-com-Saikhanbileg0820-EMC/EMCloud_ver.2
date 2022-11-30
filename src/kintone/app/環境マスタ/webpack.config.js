const path = require('path');
const webpack = require('webpack');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = (param) => {
    param.modeShort = param.mode === 'development' ? 'dev' : 'prd';
    const fullhash = '[fullhash]';
    let indexFile = 'index.js';
    if (param.mode === 'development') {
        indexFile = 'indexDev.js';
    }
    return {
        entry: path.resolve(__dirname, `./src/js/${indexFile}`),
        mode: param.mode,
        output: {
            path: path.resolve(__dirname, 'dist', param.modeShort),
            filename: `${param.name}-${param.modeShort}-[fullhash].js`,
            assetModuleFilename: 'images/[name][ext]',
            clean: true,
        },
        performance: { hints: false },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        {
                            loader: MiniCSSExtractPlugin.loader,
                        },
                        'css-loader',
                    ],
                },
                {
                    test: /\.(png|jpg|gif)$/i,
                    type: 'asset/inline',
                },
            ],
        },
        resolve: {
            alias: {
                '@js': path.resolve(__dirname, 'src/js/'),
                '@_common': path.resolve(__dirname, './../../_common/'),
            },
        },
        plugins: [
            new webpack.SourceMapDevToolPlugin({
                append: `\n//# sourceMappingURL=http://localhost:8000/app/${param.name}/dist/prd/${param.name}-${param.modeShort}-${fullhash}.map`,
                filename: `./${param.name}-${param.modeShort}-${fullhash}.map`,
                test: /\.js$/i,
            }),
            new MiniCSSExtractPlugin({
                filename: `${param.name}-${param.modeShort}-[fullhash].css`,
            }),
        ],
        target: ['web', 'es5'],
    };
};
