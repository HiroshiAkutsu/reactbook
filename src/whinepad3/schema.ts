import classification from './classification';

export default [
    {
        id: 'name',
        label: '名前',
        show: true,
        sample: '2ドルのシャック',
        align: 'left'
    },
    {
        id: 'year',
        label: '年',
        type: 'year',
        show: true,
        sample: 2015
    },
    {
        id: 'grape',
        label: 'ぶどう',
        type: 'suggest',
        options: classification.grapes,
        show : true,
        sample: 'メルロー',
        align: 'left'
    },
    {
        id: 'rating',
        label: '評価',
        type: 'rating',
        show: true,
        sample: 3
    },
    {
        id: 'comments',
        label: 'コメント',
        type: 'text',
        sample: '値段の割には良い'
    }
];