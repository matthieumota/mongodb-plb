// Import
mongoimport --db my_db --collection books books.json --jsonArray

// Lister tous les livres (Books)
db.books.find({type: 'Book'})

// Lister les documents depuis 2000
db.books.find({year: { $gte: 2000 }})

// Lister les livres depuis 2010
db.books.find({type: 'Book', year: { $gte: 2010 }})

// Lister les documents de l'auteur Michael Schmitz
db.books.find({authors: 'Michael Schmitz'})

// Lister les éditeurs
db.books.distinct('publisher')

// Lister les auteurs
db.books.distinct('authors')

// Trier les documents de Michael Schmitz par titre et par page de début
db.books.aggregate([
    { $match: { authors: 'Michael Schmitz' } },
    { $sort: { title: 1, 'pages.start': 1 } }
])

// Afficher uniquement le titre et les pages en résultat (Avec la projection)
db.books.aggregate([
    { $match: { authors: 'Michael Schmitz' } },
    { $sort: { title: 1, 'pages.start': 1 } },
    { $project: { _id: 0, title: 1, 'pages.start': 1 } }
])

// Compter le nombre de ses documents
// db.books.find({ authors: 'Michael Schmitz' }).count()
db.books.aggregate([
    { $match: { authors: 'Michael Schmitz' } },
    { $group: { _id: null, total: { $sum: 1 } } }
])

// Compter le nombre de documents depuis 2000 et par type
db.books.aggregate([
    { $match: { year: { $gte: 2000 } } },
    { $group: { _id: '$type', total: { $sum: 1 } } }
])

// Compter le nombre de documents par auteur et trier le résultat par ordre décroissant
db.books.aggregate([
    { $unwind: '$authors' },
    { $group: { _id: '$authors', total: { $sum: 1 } } },
    { $sort: { total: -1 } }
])

// Pour chaque document qui est un livre, émettre le document comme valeur avec comme clé son année
// On appliquera ensuite un reduce pour avoir le nombre de livres par année
db.books.mapReduce(
    function () {
        if ('Book' === this.type) {
            emit(this.year, this)
        }
    },
    function (key, values) {
        return values.length + ' livres en ' + key;
    },
    {
        out: { inline: 1 },
        finalize: function (key, value) {
            if ('object' === typeof value) {
                return '1 livre en ' + key;
            }
            
            return value;
        }
    }
)

// Compter le nombre d'auteurs pour chacun de ces livres par année
db.books.mapReduce(
    function () {
        if ('Book' === this.type) {
            emit(this.year, this.authors.length)
        }
    },
    function (key, values) {
        return Array.sum(values);
    },
    {
        out: { inline: 1 }
    }
)
