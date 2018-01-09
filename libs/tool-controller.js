const { exec } = require('child_process');
const conf = require('../conf.json');
const fs = require('fs');
const path = require('path');

const jobs = require('./jobs.js');

module.exports.process = (tool, files, settings, cb) => {
    if (!files) return cb(new Error("Invalid datafile."));
    if (!tool) return cb(new Error("No tool specified."));

    let files_absolute = {};
    for (let file_group in files) {
        files_absolute[file_group] = files[file_group].map((file) => {
            return file.uploaded == "true" ? path.join(conf.uploadDir, file.path) : path.join(conf.dataDir, file.path)
        });
    }

    files = files_absolute;

    let job = Date.now();
    let log = `&>> ${conf.jobDir}${job}/log.txt`;
    let cmd = "";

    switch (tool) {
        // ------------------------------------------------------------------------------------------------------------------------------------------
        case "bigsi":
            let tempDir = conf.jobDir + job + '/temp';

            cmd = `\
                echo 'QBIO: PREPARING DATA...' ${log} && \
                ${(() => {
                    let mccortex_builds = [];
                    files['files'].forEach((file, index) => {
                        let filename = path.parse(file).name;
                        mccortex_builds.push(`mccortex/bin/mccortex31 build -k ${settings['kmer-size']} -s ${filename} -1 ${file} ${tempDir}/${filename}.ctx ${log}`);
                    })
                    return mccortex_builds.join(' && ');
                })()} && \
                echo 'QBIO: CONSTRUCTING BLOOM FILTERS...' ${log} && \
                bigsi init ${tempDir}/database.bigsi --k ${settings['kmer-size']} --m ${settings['m']} --h ${settings['h']} ${log} && \
                ${(() => {
                    let bigsi_blooms = [];
                    files['files'].forEach((file, index) => {
                        let filename = path.parse(file).name;
                        bigsi_blooms.push(`bigsi bloom --db ${tempDir}/database.bigsi -c ${tempDir}/${filename}.ctx ${tempDir}/${filename}.bloom ${log}`);
                    })
                    return bigsi_blooms.join(' && ');
                })()} && \ 
                echo 'QBIO: BUILDING COMBINED GRAPH...' ${log} && \
                bigsi build ${tempDir}/database.bigsi \
                    ${(() => {
                        let bloom_files = [];
                        files['files'].forEach((file, index) => {
                            let filename = path.parse(file).name;
                            bloom_files.push(`${tempDir}/${filename}.bloom`)
                        })
                        return bloom_files.join(' ');
                    })()} ${log} && \
                echo 'QBIO: QUERYING...' ${log} && \
                bigsi search --db ${tempDir}/database.bigsi -s ${settings['query-seq']} -o ${settings['output']} \
                    > ${conf.jobDir}${job}/result.txt && \
                rm -Rf ${tempDir} \
            `;
            break;
        // ------------------------------------------------------------------------------------------------------------------------------------------
        case "bloom_filter":
            let file = files['file'][0];

            cmd = `\
                fsharpi executor.fsx ${file} ${conf.jobDir}${job}/result.txt \
                    -chart ${conf.jobDir}${job}/chart.html \
                    -block ${settings['block-size']} \
                    -k ${settings['kmer-size']} \
                    -m ${settings['filter-size']} \
                    -f ${settings['hash-functions']} \
                    -threshold ${settings['kmer-threshold']} \
                    -comparekmers true \
                    ${log} \
            `;
            break;
        // ------------------------------------------------------------------------------------------------------------------------------------------
        case "maxbin":
            let contig = files['contig'][0];
            let reads = files['reads'];
        
            cmd = `\
                cd ${conf.jobDir}${job} && \
                echo ${reads.join('\n')} >> readslist.txt && \
                perl /MaxBin-2.2.4/run_MaxBin.pl -contig ${contig} -reads_list readslist.txt -out result ${log} \
            `;
            break;
        // ------------------------------------------------------------------------------------------------------------------------------------------
        case "metabat":
            let assembly = files['assembly'][0];
            let bams = files['bams'];
        
            cmd = `\
                cd ${conf.jobDir}${job} && \
                jgi_summarize_bam_contig_depths --outputDepth depth.txt ${bams.join(' ')} ${log} && \
                cat depth.txt ${log} && \
                metabat2 -i ${assembly} -a depth.txt -o ./bins ${log} \
            `;
            break;
        // ------------------------------------------------------------------------------------------------------------------------------------------
        case "mmseqs2":
            let queryDB = files['query'][0];
            let targetDB = files['target'][0];
        
            cmd =`\
                cd ${conf.jobDir}${job} && \
                mkdir temp && cd temp && mkdir temp && \
                echo 'QBIO: CONVERTING TO MMSEQS DB FORMAT...' ${log} && \
                mmseqs createdb ${queryDB} queryDB ${log} && \
                mmseqs createdb ${targetDB} targetDB ${log} && \
                echo 'QBIO: SEARCHING...' ${log} && \
                mmseqs search queryDB targetDB resultDB temp \
                    ${settings['pairwise'] ? '-a' : ''} \
                    ${log} && \
                echo 'QBIO: CREATING RESULT TSV...' ${log} && \
                mmseqs convertalis queryDB targetDB resultDB result.m8 \
                    ${settings['pairwise'] ? '--format-mode 1' : ''} \
                    ${log} && \
                cd ../ && \
                echo 'qId\ttId\tseqIdentity\talnLen\tmismatchCnt\tgapOpenCnt\tqStart\tqEnd\ttStart\ttEnd\teVal\tbitScore\n' > result.txt && \
                cat temp/result.m8 >> result.txt && \
                rm -r temp \
            `;
            break;
        // ------------------------------------------------------------------------------------------------------------------------------------------
    }

    try {
        exec(`docker exec qbio_${tool} bash -c "${cmd}"`, (error, stdout, stderr) => {
            jobs.update(job, {
                finished_at: Date.now(),
                error: error && error.message
            });
        })
    } catch(err) {
        return cb(new Error("Error starting job."));
    }

    jobs.create(job, tool, JSON.stringify(files), (err) => {
        if (err) return cb(new Error("Error creating job."));
        cb(null, job);
    });
}